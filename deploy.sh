#!/bin/bash

# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装必要的软件包
sudo apt install -y curl git python3 python3-pip python3-venv nginx

# 安装 Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# 创建应用目录
sudo mkdir -p /opt/engineerlab
sudo chown -R $USER:$USER /opt/engineerlab
cd /opt/engineerlab

# 克隆代码
git clone https://github.com/IdiotYi/EngineerGrowthLab.git .

# 设置 Python 虚拟环境
python3 -m venv venv
source venv/bin/activate
cd server
pip install -r requirements.txt

# 创建 systemd 服务文件 - Backend
sudo tee /etc/systemd/system/engineerlab-backend.service << EOF
[Unit]
Description=EngineerLab Backend
After=network.target

[Service]
User=$USER
WorkingDirectory=/opt/engineerlab/server
Environment="PATH=/opt/engineerlab/venv/bin"
ExecStart=/opt/engineerlab/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
EOF

# 安装前端依赖
cd ../
npm install
npm run build

# 创建 Nginx 配置目录
sudo mkdir -p /etc/nginx/sites-available
sudo mkdir -p /etc/nginx/sites-enabled

# 配置 Nginx
sudo tee /etc/nginx/sites-available/engineerlab << EOF
server {
    listen 80;
    server_name your_domain.com;  # 替换为你的域名

    location / {
        root /opt/engineerlab/.next;
        try_files \$uri \$uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# 启用 Nginx 配置
sudo ln -sf /etc/nginx/sites-available/engineerlab /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx

# 启动服务
sudo systemctl enable engineerlab-backend
sudo systemctl start engineerlab-backend

echo "部署完成！" 