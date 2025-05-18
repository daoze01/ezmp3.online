from flask import Blueprint, request, jsonify, send_file, current_app
import os
import uuid
import yt_dlp
import ffmpeg
import time
import shutil
from werkzeug.utils import secure_filename

api_bp = Blueprint('api', __name__)

# 创建临时文件夹
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'static', 'temp')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# 设置允许的文件扩展名
ALLOWED_EXTENSIONS = {'mp4', 'webm', 'mkv', 'avi', 'mov', 'flv'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def clean_old_files():
    """清理超过24小时的临时文件"""
    current_time = time.time()
    for filename in os.listdir(UPLOAD_FOLDER):
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        # 如果文件或目录的最后修改时间超过24小时
        if os.path.exists(file_path) and os.stat(file_path).st_mtime < current_time - 86400:
            if os.path.isfile(file_path):
                os.remove(file_path)
            elif os.path.isdir(file_path):
                shutil.rmtree(file_path)

@api_bp.route('/info', methods=['POST'])
def get_video_info():
    """获取视频信息"""
    data = request.get_json()
    if not data or 'url' not in data:
        return jsonify({'error': '请提供视频URL'}), 400
    
    video_url = data['url']
    
    try:
        # 配置yt-dlp选项
        ydl_opts = {
            'quiet': True,
            'no_warnings': True,
            'skip_download': True,
            'format': 'best',
        }
        
        # 获取视频信息
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(video_url, download=False)
            
            # 提取需要的信息
            video_info = {
                'title': info.get('title', '未知标题'),
                'duration': info.get('duration', 0),
                'thumbnail': info.get('thumbnail', ''),
                'formats': [],
                'uploader': info.get('uploader', '未知上传者'),
                'view_count': info.get('view_count', 0),
                'upload_date': info.get('upload_date', ''),
                'description': info.get('description', '无描述'),
            }
            
            # 提取可用的视频格式
            if 'formats' in info:
                for fmt in info['formats']:
                    if fmt.get('vcodec', 'none') != 'none' and fmt.get('acodec', 'none') != 'none':
                        format_info = {
                            'format_id': fmt.get('format_id', ''),
                            'format_note': fmt.get('format_note', ''),
                            'ext': fmt.get('ext', ''),
                            'filesize': fmt.get('filesize', 0),
                            'height': fmt.get('height', 0),
                            'width': fmt.get('width', 0),
                        }
                        video_info['formats'].append(format_info)
            
            return jsonify(video_info)
    
    except Exception as e:
        return jsonify({'error': f'获取视频信息失败: {str(e)}'}), 500

@api_bp.route('/download', methods=['POST'])
def download_video():
    """下载视频"""
    data = request.get_json()
    if not data or 'url' not in data:
        return jsonify({'error': '请提供视频URL'}), 400
    
    video_url = data['url']
    format_id = data.get('format_id', 'best')
    
    try:
        # 清理旧文件
        clean_old_files()
        
        # 生成唯一文件名
        file_id = str(uuid.uuid4())
        temp_dir = os.path.join(UPLOAD_FOLDER, file_id)
        os.makedirs(temp_dir, exist_ok=True)
        
        # 配置yt-dlp选项
        ydl_opts = {
            'format': format_id,
            'outtmpl': os.path.join(temp_dir, '%(title)s.%(ext)s'),
            'quiet': True,
            'no_warnings': True,
        }
        
        # 下载视频
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(video_url, download=True)
            downloaded_file = ydl.prepare_filename(info)
            
            # 确保文件存在
            if not os.path.exists(downloaded_file):
                return jsonify({'error': '视频下载失败'}), 500
            
            # 获取文件名和扩展名
            filename = os.path.basename(downloaded_file)
            
            # 返回下载信息
            return jsonify({
                'success': True,
                'message': '视频下载成功',
                'file_id': file_id,
                'filename': filename,
                'download_url': f'/api/file/{file_id}/{filename}'
            })
    
    except Exception as e:
        return jsonify({'error': f'视频下载失败: {str(e)}'}), 500

@api_bp.route('/convert', methods=['POST'])
def convert_to_mp3():
    """将视频转换为MP3"""
    data = request.get_json()
    if not data or ('url' not in data and 'file_id' not in data):
        return jsonify({'error': '请提供视频URL或文件ID'}), 400
    
    try:
        # 清理旧文件
        clean_old_files()
        
        # 生成唯一文件名
        file_id = data.get('file_id', str(uuid.uuid4()))
        temp_dir = os.path.join(UPLOAD_FOLDER, file_id)
        os.makedirs(temp_dir, exist_ok=True)
        
        # 如果提供了URL，先下载视频
        if 'url' in data and not 'file_id' in data:
            video_url = data['url']
            
            # 配置yt-dlp选项
            ydl_opts = {
                'format': 'best',
                'outtmpl': os.path.join(temp_dir, '%(title)s.%(ext)s'),
                'quiet': True,
                'no_warnings': True,
            }
            
            # 下载视频
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(video_url, download=True)
                video_file = ydl.prepare_filename(info)
                
                # 确保文件存在
                if not os.path.exists(video_file):
                    return jsonify({'error': '视频下载失败'}), 500
        
        # 如果提供了file_id，查找已下载的视频文件
        elif 'file_id' in data and 'filename' in data:
            file_id = data['file_id']
            filename = data['filename']
            video_file = os.path.join(UPLOAD_FOLDER, file_id, filename)
            
            # 确保文件存在
            if not os.path.exists(video_file):
                return jsonify({'error': '找不到指定的视频文件'}), 404
        else:
            return jsonify({'error': '参数不完整'}), 400
        
        # 设置MP3输出文件名
        mp3_filename = os.path.splitext(os.path.basename(video_file))[0] + '.mp3'
        mp3_file = os.path.join(temp_dir, mp3_filename)
        
        # 设置音频质量
        audio_quality = data.get('quality', '192')
        
        # 使用ffmpeg转换为MP3
        try:
            (
                ffmpeg
                .input(video_file)
                .output(mp3_file, acodec='libmp3lame', ab=f'{audio_quality}k', map='a')
                .run(quiet=True, overwrite_output=True)
            )
        except ffmpeg.Error as e:
            return jsonify({'error': f'音频转换失败: {str(e)}'}), 500
        
        # 确保MP3文件存在
        if not os.path.exists(mp3_file):
            return jsonify({'error': '音频转换失败'}), 500
        
        # 返回转换信息
        return jsonify({
            'success': True,
            'message': '视频成功转换为MP3',
            'file_id': file_id,
            'filename': mp3_filename,
            'download_url': f'/api/file/{file_id}/{mp3_filename}'
        })
    
    except Exception as e:
        return jsonify({'error': f'视频转换失败: {str(e)}'}), 500

@api_bp.route('/file/<file_id>/<filename>', methods=['GET'])
def get_file(file_id, filename):
    """获取下载的文件"""
    # 安全检查
    if '..' in file_id or '..' in filename:
        return jsonify({'error': '无效的文件路径'}), 400
    
    file_path = os.path.join(UPLOAD_FOLDER, file_id, filename)
    
    # 确保文件存在
    if not os.path.exists(file_path):
        return jsonify({'error': '文件不存在'}), 404
    
    # 设置文件下载名称
    return send_file(
        file_path,
        as_attachment=True,
        download_name=filename
    )

@api_bp.route('/upload', methods=['POST'])
def upload_file():
    """上传本地视频文件"""
    # 检查是否有文件
    if 'file' not in request.files:
        return jsonify({'error': '没有文件'}), 400
    
    file = request.files['file']
    
    # 检查文件名
    if file.filename == '':
        return jsonify({'error': '没有选择文件'}), 400
    
    # 检查文件类型
    if not allowed_file(file.filename):
        return jsonify({'error': '不支持的文件类型'}), 400
    
    try:
        # 清理旧文件
        clean_old_files()
        
        # 生成唯一文件名
        file_id = str(uuid.uuid4())
        temp_dir = os.path.join(UPLOAD_FOLDER, file_id)
        os.makedirs(temp_dir, exist_ok=True)
        
        # 安全地保存文件
        filename = secure_filename(file.filename)
        file_path = os.path.join(temp_dir, filename)
        file.save(file_path)
        
        # 返回上传信息
        return jsonify({
            'success': True,
            'message': '文件上传成功',
            'file_id': file_id,
            'filename': filename,
            'download_url': f'/api/file/{file_id}/{filename}'
        })
    
    except Exception as e:
        return jsonify({'error': f'文件上传失败: {str(e)}'}), 500

@api_bp.route('/batch', methods=['POST'])
def batch_process():
    """批量处理视频"""
    data = request.get_json()
    if not data or 'urls' not in data:
        return jsonify({'error': '请提供视频URL列表'}), 400
    
    video_urls = data['urls']
    convert_to_mp3 = data.get('convert_to_mp3', False)
    
    results = []
    
    try:
        # 清理旧文件
        clean_old_files()
        
        # 生成唯一文件夹
        batch_id = str(uuid.uuid4())
        temp_dir = os.path.join(UPLOAD_FOLDER, batch_id)
        os.makedirs(temp_dir, exist_ok=True)
        
        for url in video_urls:
            try:
                # 配置yt-dlp选项
                ydl_opts = {
                    'format': 'best',
                    'outtmpl': os.path.join(temp_dir, '%(title)s.%(ext)s'),
                    'quiet': True,
                    'no_warnings': True,
                }
                
                # 下载视频
                with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                    info = ydl.extract_info(url, download=True)
                    video_file = ydl.prepare_filename(info)
                    
                    result = {
                        'url': url,
                        'title': info.get('title', '未知标题'),
                        'status': 'success',
                        'video_file': os.path.basename(video_file),
                    }
                    
                    # 如果需要转换为MP3
                    if convert_to_mp3:
                        mp3_filename = os.path.splitext(os.path.basename(video_file))[0] + '.mp3'
                        mp3_file = os.path.join(temp_dir, mp3_filename)
                        
                        # 使用ffmpeg转换为MP3
                        try:
                            (
                                ffmpeg
                                .input(video_file)
                                .output(mp3_file, acodec='libmp3lame', ab='192k', map='a')
                                .run(quiet=True, overwrite_output=True)
                            )
                            result['mp3_file'] = mp3_filename
                        except ffmpeg.Error as e:
                            result['mp3_status'] = f'转换失败: {str(e)}'
                    
                    results.append(result)
            
            except Exception as e:
                results.append({
                    'url': url,
                    'status': 'failed',
                    'error': str(e)
                })
        
        return jsonify({
            'success': True,
            'message': '批量处理完成',
            'batch_id': batch_id,
            'results': results
        })
    
    except Exception as e:
        return jsonify({'error': f'批量处理失败: {str(e)}'}), 500
