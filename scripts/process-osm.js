/**
 * OSM 数据处理脚本
 * 用于将下载的 OSM 数据转换为瓦片格式
 */

const fs = require('fs');
const path = require('path');

// 创建瓦片目录结构
function createTileDirectories() {
  const zoomLevels = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
  
  zoomLevels.forEach(zoom => {
    // 海南省的大致瓦片范围 (根据经纬度计算)
    // 海南省经纬度范围大约: 东经108°30' - 111°15'，北纬18°10' - 20°10'
    const minTileX = Math.floor((108.5 + 180) / 360 * Math.pow(2, zoom));
    const maxTileX = Math.ceil((111.25 + 180) / 360 * Math.pow(2, zoom));
    const minTileY = Math.floor((1 - Math.log(Math.tan((20 + 90) * Math.PI / 360)) / Math.PI) / 2 * Math.pow(2, zoom));
    const maxTileY = Math.ceil((1 - Math.log(Math.tan((18 + 90) * Math.PI / 360)) / Math.PI) / 2 * Math.pow(2, zoom));
    
    for (let x = minTileX; x <= maxTileX; x++) {
      const dirPath = path.join('public', 'tiles', zoom.toString(), x.toString());
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
      
      // 为每个瓦片创建占位符图像
      for (let y = minTileY; y <= maxTileY; y++) {
        const tilePath = path.join(dirPath, `${y}.png`);
        if (!fs.existsSync(tilePath)) {
          // 创建简单的占位符图像
          createPlaceholderTile(tilePath, zoom, x, y);
        }
      }
    }
  });
  
  console.log('瓦片目录结构创建完成');
}

// 创建占位符瓦片图像
function createPlaceholderTile(tilePath, zoom, x, y) {
  const svgContent = `
    <svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
      <rect width="256" height="256" fill="#e0e0e0"/>
      <text x="128" y="128" font-family="Arial" font-size="20" text-anchor="middle" fill="#666">
        ${zoom}/${x}/${y}
      </text>
      <text x="128" y="158" font-family="Arial" font-size="16" text-anchor="middle" fill="#666">
        海南
      </text>
    </svg>
  `;
  
  fs.writeFileSync(tilePath.replace('.png', '.svg'), svgContent);
}

// 更新离线地图组件以使用真实的瓦片URL
function updateOfflineMapComponent() {
  const componentPath = path.join('src', 'pages', 'OfflineMap', 'index.tsx');
  
  if (fs.existsSync(componentPath)) {
    let content = fs.readFileSync(componentPath, 'utf8');
    
    // 更新TileLayer的URL
    content = content.replace(
      'url="/tiles/{z}/{x}/{y}.png"',
      'url="/tiles/{z}/{x}/{y}.png"'
    );
    
    fs.writeFileSync(componentPath, content, 'utf8');
    console.log('离线地图组件已更新');
  }
}

// 主函数
function main() {
  console.log('开始处理OSM数据...');
  
  // 创建瓦片目录结构
  createTileDirectories();
  
  // 更新离线地图组件
  updateOfflineMapComponent();
  
  console.log('OSM数据处理完成');
  console.log('\n使用说明:');
  console.log('1. 将下载的MBTiles文件放置在 public/tiles/ 目录下');
  console.log('2. 如果使用tileserver-gl，可以运行: npx tileserver-gl -p 8080 public/tiles/*.mbtiles');
  console.log('3. 访问 http://localhost:3000/offline-map 查看离线地图');
}

// 执行主函数
main();