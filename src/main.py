import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))  # DON'T CHANGE THIS !!!

from flask import Flask, render_template, send_from_directory
from flask_cors import CORS
import logging

# 导入路由
from src.routes.api import api_bp

def create_app():
    app = Flask(__name__)
    CORS(app)  # 启用CORS支持
    
    # 配置日志
    logging.basicConfig(level=logging.INFO)
    
    # 注册蓝图
    app.register_blueprint(api_bp, url_prefix='/api')
    
    # 静态文件路由
    @app.route('/static/<path:path>')
    def send_static(path):
        return send_from_directory('static', path)
    
    # 主页路由
    @app.route('/')
    def index():
        return render_template('index.html')
    
    # 视频下载页面
    @app.route('/download')
    def download_page():
        return render_template('download.html')
    
    # 视频转MP3页面
    @app.route('/convert')
    def convert_page():
        return render_template('convert.html')
    
    # 批量处理页面
    @app.route('/batch')
    def batch_page():
        return render_template('batch.html')
    
    # 教程页面
    @app.route('/tutorials')
    def tutorials_page():
        return render_template('tutorials.html')
    
    # 特定平台教程页面
    @app.route('/tutorials/<platform>')
    def platform_tutorial(platform):
        return render_template('tutorials_platform.html', platform=platform)
    
    # 常见问题页面
    @app.route('/faq')
    def faq_page():
        return render_template('faq.html')
    
    # 博客页面
    @app.route('/blog')
    def blog_page():
        return render_template('blog.html')
    
    # 博客文章页面
    @app.route('/blog/<slug>')
    def blog_article(slug):
        return render_template('blog_article.html', slug=slug)
    
    # 关于我们页面
    @app.route('/about')
    def about_page():
        return render_template('about.html')
    
    # 联系我们页面
    @app.route('/contact')
    def contact_page():
        return render_template('contact.html')
    
    # 隐私政策页面
    @app.route('/privacy-policy')
    def privacy_policy_page():
        return render_template('privacy_policy.html')
    
    # 服务条款页面
    @app.route('/terms-of-service')
    def terms_of_service_page():
        return render_template('terms_of_service.html')
    
    return app

app = create_app()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
