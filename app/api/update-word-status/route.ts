import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { word, stage } = await request.json();
    
    if (!word || !stage) {
      return NextResponse.json(
        { error: '请提供单词和阶段信息' },
        { status: 400 }
      );
    }

    console.log(`更新单词状态: ${word}, 阶段: ${stage}`);

    // 获取当前的完成状态
    const currentRecord = await query(
      'SELECT completion_status FROM word_study_records WHERE word = ?',
      [word]
    );

    if (!currentRecord || !Array.isArray(currentRecord) || currentRecord.length === 0) {
      return NextResponse.json(
        { error: '未找到该单词的学习记录' },
        { status: 404 }
      );
    }

    // 解析当前的完成状态
    let completionStatus;
    try {
      completionStatus = typeof currentRecord[0].completion_status === 'string' 
        ? JSON.parse(currentRecord[0].completion_status) 
        : currentRecord[0].completion_status;
    } catch (e) {
      console.error('解析completion_status失败:', currentRecord[0].completion_status);
      return NextResponse.json(
        { error: '学习记录数据格式错误' },
        { status: 500 }
      );
    }

    console.log('当前完成状态:', completionStatus);

    // 更新指定阶段的状态为"已完成"
    completionStatus[stage] = '已完成';

    console.log('更新后的完成状态:', completionStatus);

    // 更新数据库
    await query(
      'UPDATE word_study_records SET completion_status = ? WHERE word = ?',
      [JSON.stringify(completionStatus), word]
    );

    return NextResponse.json({
      success: true,
      message: `单词 "${word}" 的阶段 ${stage} 已标记为已完成`,
      word: word,
      stage: stage,
      newStatus: completionStatus
    });

  } catch (error) {
    console.error('更新单词状态失败:', error);
    return NextResponse.json(
      { 
        error: '更新单词状态失败',
        details: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    );
  }
}