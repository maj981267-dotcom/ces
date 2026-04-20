import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    console.log('=== 开始获取学习单词 ===');
    
    const { currentTime } = await request.json();
    console.log('接收到的时间:', currentTime);
    
    if (!currentTime) {
      return NextResponse.json(
        { error: '请提供当前时间' },
        { status: 400 }
      );
    }

    // 获取所有学习记录和对应的单词信息
    const studyRecords = await query(`
      SELECT wsr.*, w.word, w.common_meanings, w.uncommon_meanings, w.english_examples,
             w.synonyms, w.antonyms, w.derivatives, w.prefixes, w.roots,
             w.collocations, w.confusing_words, w.context, w.importance_level, w.memory_aid
      FROM word_study_records wsr
      JOIN words w ON wsr.word = w.word
      ORDER BY wsr.created_at DESC
    `);

    console.log('查询到的记录数:', studyRecords?.length || 0);

    if (!studyRecords || !Array.isArray(studyRecords) || studyRecords.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        message: '暂无学习记录'
      });
    }

    const currentDateTime = new Date(currentTime);
    console.log('当前时间:', currentDateTime.toISOString());
    
    const wordsToStudy: any[] = [];
    const debugInfo: any[] = [];
    let totalLoopCount = 0; // 添加循环计数器

    console.log(`开始处理 ${studyRecords.length} 条记录...`);

    // 检查每个单词的学习记录
    for (let recordIndex = 0; recordIndex < studyRecords.length; recordIndex++) {
      const record = studyRecords[recordIndex];
      
      try {
        console.log(`\n=== 处理第 ${recordIndex + 1} 条记录: ${record.word} ===`);
        
        const wordDebug = {
          word: record.word,
          stages: [],
          shouldShow: false,
          reason: ''
        };

        // 解析完成状态
        let completionStatus;
        try {
          completionStatus = typeof record.completion_status === 'string' 
            ? JSON.parse(record.completion_status) 
            : record.completion_status;
        } catch (e) {
          console.error('解析completion_status失败:', record.word, record.completion_status);
          wordDebug.reason = 'completion_status解析失败';
          debugInfo.push(wordDebug);
          continue;
        }
        
        // 按优先级检查每个阶段 A -> B -> C -> D -> E -> F -> G
        const timeSlots = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
        let shouldShowWord = false;
        let matchedStage = null;
        
        for (let slotIndex = 0; slotIndex < timeSlots.length; slotIndex++) {
          const slot = timeSlots[slotIndex];
          totalLoopCount++; // 计数每次循环
          
          console.log(`  检查阶段 ${slot} (循环计数: ${totalLoopCount})`);
          
          const stageStatus = completionStatus[slot];
          const timeField = `time_${slot.toLowerCase()}`;
          const timeRange = record[timeField];
          
          const stageDebug = {
            stage: slot,
            status: stageStatus,
            timeRange: timeRange,
            decision: '',
            shouldShow: false
          };

          if (!timeRange) {
            stageDebug.decision = '时间段为空，跳过';
            console.log(`    时间段为空，跳过`);
            wordDebug.stages.push(stageDebug);
            continue;
          }

          try {
            // 解析时间范围：格式 "YYYY-MM-DD HH:MM:SS-HH:MM:SS"
            const parts = timeRange.split(' ');
            if (parts.length !== 2) {
              stageDebug.decision = `时间格式错误: ${timeRange}`;
              console.log(`    时间格式错误: ${timeRange}`);
              wordDebug.stages.push(stageDebug);
              continue;
            }
            
            const [datePart, timePart] = parts;
            const timeParts = timePart.split('-');
            if (timeParts.length !== 2) {
              stageDebug.decision = `时间段格式错误: ${timePart}`;
              console.log(`    时间段格式错误: ${timePart}`);
              wordDebug.stages.push(stageDebug);
              continue;
            }
            
            const [startTime, endTime] = timeParts;
            
            // 构建开始和结束时间
            const startDateTime = new Date(`${datePart} ${startTime}`);
            const endDateTime = new Date(`${datePart} ${endTime}`);
            
            // 检查日期是否有效
            if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
              stageDebug.decision = `无效的时间: ${datePart} ${startTime} - ${endTime}`;
              console.log(`    无效的时间: ${datePart} ${startTime} - ${endTime}`);
              wordDebug.stages.push(stageDebug);
              continue;
            }
            
            // 判断当前时间与时间段的关系
            const inTimeRange = currentDateTime >= startDateTime && currentDateTime <= endDateTime;
            const beforeStart = currentDateTime < startDateTime;
            const afterEnd = currentDateTime > endDateTime;
            
            // 四种情况的判断逻辑
            if (stageStatus === '已完成') {
              if (inTimeRange) {
                // 情况1: 已完成 + 当前时间在time_时间内 -> 判断下一个阶段
                stageDebug.decision = '已完成且在时间内，检查下一阶段';
                console.log(`    情况1: 已完成且在时间内，继续检查下一阶段`);
              } else {
                // 情况2: 已完成 + 不在时间内 -> 判断下一个阶段
                stageDebug.decision = '已完成且不在时间内，检查下一阶段';
                console.log(`    情况2: 已完成且不在时间内，继续检查下一阶段`);
              }
              // 已完成的阶段，继续检查下一个阶段
              wordDebug.stages.push(stageDebug);
              continue;
            } else if (stageStatus === '未完成') {
              if (inTimeRange) {
                // 情况3: 未完成 + 在时间内 -> 显示单词
                stageDebug.decision = '未完成且在时间内，显示单词';
                stageDebug.shouldShow = true;
                shouldShowWord = true;
                matchedStage = slot;
                console.log(`    ✓ 情况3: 未完成且在时间内，显示单词`);
                wordDebug.stages.push(stageDebug);
                break; // 找到要显示的单词，停止检查后续阶段
              } else {
                // 情况4: 未完成 + 不在时间内
                if (afterEnd) {
                  // 当前时间 > 结束时间 -> 强制推送至列表
                  stageDebug.decision = '未完成且超过结束时间，强制显示';
                  stageDebug.shouldShow = true;
                  shouldShowWord = true;
                  matchedStage = slot;
                  console.log(`    ✓ 情况4a: 未完成且超过结束时间，强制显示单词`);
                  wordDebug.stages.push(stageDebug);
                  break; // 找到要显示的单词，停止检查后续阶段
                } else if (beforeStart) {
                  // 当前时间 < 开始时间 -> 跳过当前数据
                  stageDebug.decision = '未完成但早于开始时间，跳过';
                  console.log(`    ✗ 情况4b: 未完成但早于开始时间，跳过整个单词`);
                  wordDebug.stages.push(stageDebug);
                  break; // 时间还没到，停止检查后续阶段
                }
              }
            }
            
            wordDebug.stages.push(stageDebug);
          } catch (timeError) {
            stageDebug.decision = `时间解析错误: ${timeError.message}`;
            console.error(`    时间解析错误:`, timeError);
            wordDebug.stages.push(stageDebug);
            continue;
          }
        }
        
        // 如果应该显示这个单词，添加到结果列表
        if (shouldShowWord && matchedStage) {
          wordsToStudy.push({
            ...record,
            currentStage: matchedStage,
            stageTimeRange: record[`time_${matchedStage.toLowerCase()}`],
            stageStatus: completionStatus[matchedStage]
          });
          wordDebug.shouldShow = true;
          wordDebug.reason = `匹配阶段 ${matchedStage}，应该显示`;
          console.log(`✓ 添加单词到学习列表: ${record.word} (阶段 ${matchedStage})`);
        } else {
          wordDebug.shouldShow = false;
          wordDebug.reason = shouldShowWord ? '未找到匹配阶段' : '所有阶段都不符合显示条件';
          console.log(`✗ 单词不显示: ${record.word} - ${wordDebug.reason}`);
        }
        
        debugInfo.push(wordDebug);
      } catch (recordError) {
        console.error('处理记录错误:', recordError, '记录:', record.word);
        debugInfo.push({
          word: record.word,
          stages: [],
          shouldShow: false,
          reason: `处理错误: ${recordError.message}`
        });
        continue;
      }
    }

    console.log(`\n=== 处理完成 ===`);
    console.log(`总循环次数: ${totalLoopCount} (预期最大: ${studyRecords.length * 7})`);
    console.log('找到需要学习的单词数:', wordsToStudy.length);
    console.log('需要学习的单词:', wordsToStudy.map(w => `${w.word}(${w.currentStage})`));

    return NextResponse.json({
      success: true,
      data: wordsToStudy,
      count: wordsToStudy.length,
      currentTime: currentTime,
      debug: {
        totalRecords: studyRecords.length,
        matchedWords: wordsToStudy.length,
        wordDetails: debugInfo
      }
    });

  } catch (error) {
    console.error('=== API 执行失败 ===');
    console.error('错误详情:', error);
    
    return NextResponse.json(
      { 
        error: '获取学习单词失败',
        details: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    );
  }
}