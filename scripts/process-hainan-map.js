/**
 * 处理海南省离线地图数据的脚本
 * 用于检查和处理 hainan-251104.osm.pbf 文件
 */

const fs = require('fs');
const path = require('path');

// 检查 OSM PBF 文件是否存在
function checkOSMFile() {
  const filePath = path.join('public', 'tiles', 'hainan-251104.osm.pbf');
  
  if (fs.existsSync(filePath)) {
    console.log('✓ 找到海南省离线地图文件: hainan-251104.osm.pbf');
    const stats = fs.statSync(filePath);
    console.log(`  文件大小: ${(stats.size / (1024 * 1024)).toFixed(2)} MB`);
    return true;
  } else {
    console.log('✗ 未找到海南省离线地图文件: hainan-251104.osm.pbf');
    console.log('  请确保文件位于 public/tiles/ 目录下');
    return false;
  }
}

// 检查是否有 MBTiles 文件
function checkMBTilesFile() {
  const dirPath = path.join('public', 'tiles');
  if (!fs.existsSync(dirPath)) {
    console.log('✗ tiles 目录不存在');
    return false;
  }
  
  const files = fs.readdirSync(dirPath);
  const mbtilesFiles = files.filter(file => file.endsWith('.mbtiles'));
  
  if (mbtilesFiles.length > 0) {
    console.log('✓ 找到以下 MBTiles 文件:');
    mbtilesFiles.forEach(file => {
      const filePath = path.join(dirPath, file);
      const stats = fs.statSync(filePath);
      console.log(`  ${file} (${(stats.size / (1024 * 1024)).toFixed(2)} MB)`);
    });
    return true;
  } else {
    console.log('ℹ 未找到 MBTiles 文件');
    return false;
  }
}

// 生成使用说明
function generateInstructions() {
  console.log('\n=== 海南省离线地图使用说明 ===');
  console.log('\n如果您想使用 hainan-251104.osm.pbf 文件，有以下几种方法:');
  console.log('\n1. 使用在线转换工具:');
  console.log('   - 访问 https://www.maptiler.com/cloud/');
  console.log('   - 注册账户并上传 hainan-251104.osm.pbf 文件');
  console.log('   - 转换为 MBTiles 格式');
  console.log('   - 下载并放置在 public/tiles/ 目录下');
  
  console.log('\n2. 使用 MapTiler 桌面软件:');
  console.log('   - 下载并安装 MapTiler Desktop');
  console.log('   - 打开 hainan-251104.osm.pbf 文件');
  console.log('   - 生成 MBTiles 文件');
  console.log('   - 将生成的文件放置在 public/tiles/ 目录下');
  
  console.log('\n3. 使用命令行工具 (需要安装 Docker):');
  console.log('   - 运行: docker run --rm -it -v %cd%/public/tiles:/data -p 8080:8080 maptiler/tileserver-gl hainan-251104.osm.pbf');
  
  console.log('\n4. 使用现有的占位符瓦片:');
  console.log('   - 当前系统已生成海南省范围的占位符瓦片');
  console.log('   - 这些瓦片显示基本的位置信息');
  
  console.log('\n=== 当前状态 ===');
  checkOSMFile();
  checkMBTilesFile();
  
  console.log('\n=== 访问离线地图 ===');
  console.log('启动开发服务器后，访问 http://localhost:3000/offline-map 查看海南省离线地图');
}

// 主函数
function main() {
  console.log('海南省离线地图处理工具');
  console.log('========================');
  
  generateInstructions();
}

// 执行主函数
main();