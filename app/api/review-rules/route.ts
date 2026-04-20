import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// 获取复习规则
export async function GET() {
  try {
    const rules = await query('SELECT rule_name, offset_days, start_time, end_time FROM review_rules ORDER BY rule_name');
    
    return NextResponse.json({
      success: true,
      data: rules
    });
  } catch (error) {
    console.error('获取复习规则失败:', error);
    return NextResponse.json(
      { 
        error: '获取复习规则失败',
        details: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    );
  }
}

// 更新复习规则
export async function PUT(request: NextRequest) {
  try {
    const { rules } = await request.json();
    
    if (!rules || !Array.isArray(rules)) {
      return NextResponse.json(
        { error: '无效的数据格式' },
        { status: 400 }
      );
    }

    // 更新每个规则
    for (const rule of rules) {
      const { rule_name, offset_days, start_time, end_time } = rule;
      
      // 验证数据
      if (!rule_name || offset_days === undefined || !start_time || !end_time) {
        return NextResponse.json(
          { error: `规则 ${rule_name} 数据不完整` },
          { status: 400 }
        );
      }

      // 验证时间格式
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;
      if (!timeRegex.test(start_time) || !timeRegex.test(end_time)) {
        return NextResponse.json(
          { error: `规则 ${rule_name} 时间格式不正确，应为 HH:MM:SS` },
          { status: 400 }
        );
      }

      // 更新数据库
      await query(
        'UPDATE review_rules SET offset_days = ?, start_time = ?, end_time = ? WHERE rule_name = ?',
        [offset_days, start_time, end_time, rule_name]
      );
    }

    return NextResponse.json({
      success: true,
      message: '复习规则更新成功'
    });

  } catch (error) {
    console.error('更新复习规则失败:', error);
    return NextResponse.json(
      { 
        error: '更新复习规则失败',
        details: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    );
  }
}