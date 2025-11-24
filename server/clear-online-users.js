import db from './src/config/database.js';

async function clearOnlineUsers() {
  try {
    const [result] = await db.query('DELETE FROM online_users');
    console.log(`✅ 已清理 ${result.affectedRows} 条历史在线用户记录`);

    const [rows] = await db.query('SELECT COUNT(*) as count FROM online_users');
    console.log(`📊 当前在线用户数: ${rows[0].count}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ 清理失败:', error);
    process.exit(1);
  }
}

clearOnlineUsers();
