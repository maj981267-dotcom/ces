import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    // 测试数据库连接
    const testQuery = await query('SELECT 1 as test') as any[];
    console.log('数据库连接测试结果:', testQuery);

    // 检查表是否存在
    const tablesQuery = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'helloworld' 
      AND table_name IN ('words', 'word_study_records', 'review_rules')
    `) as any[];
    console.log('表检查结果:', tablesQuery);

    // 检查 words 表数据
    const wordsCount = await query('SELECT COUNT(*) as count FROM words') as any[];
    console.log('words 表记录数:', wordsCount);

    // 检查 word_study_records 表数据
    const recordsCount = await query('SELECT COUNT(*) as count FROM word_study_records') as any[];
    console.log('word_study_records 表记录数:', recordsCount);

    // 检查一条学习记录的格式
    const sampleRecord = await query('SELECT * FROM word_study_records LIMIT 1') as any[];
    console.log('示例学习记录:', sampleRecord);

    return NextResponse.json({
      success: true,
      data: {
        dbConnection: testQuery,
        tables: tablesQuery,
        wordsCount: wordsCount,
        recordsCount: recordsCount,
        sampleRecord: sampleRecord
      }
    });

  } catch (error) {
    console.error('数据库测试失败:', error);
    return NextResponse.json(
      { 
        error: '数据库测试失败',
        details: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    );
  }
}