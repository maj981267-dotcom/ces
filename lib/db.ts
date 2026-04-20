import mysql from 'mysql2/promise';

// 数据库连接配置
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '123456',
  database: 'helloworld',
  port: 3306,
  charset: 'utf8mb4'
};

// 创建连接池
const pool = mysql.createPool({
  ...dbConfig,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 获取数据库连接
export async function getConnection() {
  try {
    const connection = await pool.getConnection();
    return connection;
  } catch (error) {
    console.error('数据库连接失败:', error);
    throw error;
  }
}

// 执行查询
export async function query(sql: string, params?: any[]) {
  try {
    const connection = await getConnection();
    const [results] = await connection.execute(sql, params);
    connection.release();
    return results;
  } catch (error) {
    console.error('查询执行失败:', error);
    throw error;
  }
}

// 测试数据库连接
export async function testConnection() {
  try {
    const connection = await getConnection();
    await connection.ping();
    connection.release();
    console.log('数据库连接成功！');
    return true;
  } catch (error) {
    console.error('数据库连接测试失败:', error);
    return false;
  }
}

export default pool;