import { NextResponse } from 'next/server';

// 项目启动时间（服务器启动时记录）
const PROJECT_START_TIME = Date.now();

export async function GET() {
  try {
    const currentTime = Date.now();
    const uptimeSeconds = Math.floor((currentTime - PROJECT_START_TIME) / 1000);
    
    return NextResponse.json({
      success: true,
      startTime: PROJECT_START_TIME,
      currentTime: currentTime,
      uptimeSeconds: uptimeSeconds
    });
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: '获取运行时间失败',
        details: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    );
  }
}