import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// 生成学习记录的函数
async function generateStudyRecord(word: string) {
  try {
    // 检查是否已存在学习记录
    const existingRecord = await query('SELECT id FROM word_study_records WHERE word = ?', [word]);
    if (existingRecord && Array.isArray(existingRecord) && existingRecord.length > 0) {
      // 如果已存在，删除旧记录重新生成
      await query('DELETE FROM word_study_records WHERE word = ?', [word]);
    }

    // 获取复习规则
    const reviewRules = await query('SELECT rule_name, offset_days, start_time, end_time FROM review_rules ORDER BY rule_name');
    if (!reviewRules || !Array.isArray(reviewRules) || reviewRules.length === 0) {
      throw new Error('复习规则数据不存在');
    }

    // 获取单词的导入时间
    const wordInfo = await query('SELECT imported_at FROM words WHERE word = ?', [word]);
    if (!wordInfo || !Array.isArray(wordInfo) || wordInfo.length === 0) {
      throw new Error('单词信息不存在');
    }

    const importedAt = new Date(wordInfo[0].imported_at);
    
    // 计算各个时间段
    const timeSlots: { [key: string]: string } = {};
    
    for (const rule of reviewRules) {
      // 计算目标日期：导入日期 + 偏移天数
      const targetDate = new Date(importedAt);
      targetDate.setDate(importedAt.getDate() + rule.offset_days);
      
      // 格式化日期为 YYYY-MM-DD
      const year = targetDate.getFullYear();
      const month = String(targetDate.getMonth() + 1).padStart(2, '0');
      const day = String(targetDate.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      
      const timeSlot = `${dateStr} ${rule.start_time}-${rule.end_time}`;
      timeSlots[`time_${rule.rule_name.toLowerCase()}`] = timeSlot;
    }

    // 初始化完成状态 - 所有状态都设为"未完成"
    const completionStatus = {
      A: "未完成",
      B: "未完成", 
      C: "未完成",
      D: "未完成",
      E: "未完成",
      F: "未完成",
      G: "未完成"
    };

    // 插入学习记录
    const insertSql = `
      INSERT INTO word_study_records (
        word, time_a, time_b, time_c, time_d, time_e, time_f, time_g,
        completion_status, reset_count
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
    `;

    await query(insertSql, [
      word,
      timeSlots.time_a,
      timeSlots.time_b,
      timeSlots.time_c,
      timeSlots.time_d,
      timeSlots.time_e,
      timeSlots.time_f,
      timeSlots.time_g,
      JSON.stringify(completionStatus)
    ]);

  } catch (error) {
    console.error(`生成学习记录失败 (${word}):`, error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { wordsData, overwriteDuplicates } = await request.json();
    
    if (!wordsData || !Array.isArray(wordsData)) {
      return NextResponse.json(
        { error: '无效的数据格式' },
        { status: 400 }
      );
    }

    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    for (const wordData of wordsData) {
      try {
        // 检查是否为重复单词
        const existingWord = await query('SELECT word FROM words WHERE word = ?', [wordData.word]);
        const isDuplicate = existingWord && Array.isArray(existingWord) && existingWord.length > 0;

        // 如果是重复单词且不允许覆盖，跳过
        if (isDuplicate && !overwriteDuplicates) {
          continue;
        }

        // 插入或更新数据库
        const sql = `
          INSERT INTO words (
            word, common_meanings, uncommon_meanings, english_examples, 
            synonyms, antonyms, derivatives, prefixes, roots, 
            collocations, confusing_words, context, importance_level, memory_aid, imported_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
          ON DUPLICATE KEY UPDATE
            common_meanings = VALUES(common_meanings),
            uncommon_meanings = VALUES(uncommon_meanings),
            english_examples = VALUES(english_examples),
            synonyms = VALUES(synonyms),
            antonyms = VALUES(antonyms),
            derivatives = VALUES(derivatives),
            prefixes = VALUES(prefixes),
            roots = VALUES(roots),
            collocations = VALUES(collocations),
            confusing_words = VALUES(confusing_words),
            context = VALUES(context),
            importance_level = VALUES(importance_level),
            memory_aid = VALUES(memory_aid),
            imported_at = NOW()
        `;

        await query(sql, [
          wordData.word,
          JSON.stringify(wordData.common_meanings),
          JSON.stringify(wordData.uncommon_meanings),
          JSON.stringify(wordData.english_examples),
          JSON.stringify(wordData.synonyms),
          JSON.stringify(wordData.antonyms),
          JSON.stringify(wordData.derivatives),
          JSON.stringify(wordData.prefixes),
          JSON.stringify(wordData.roots),
          JSON.stringify(wordData.collocations),
          JSON.stringify(wordData.confusing_words || wordData.confusable_words),
          JSON.stringify(wordData.context),
          wordData.importance_level,
          wordData.memory_aid
        ]);

        // 生成对应的学习记录
        await generateStudyRecord(wordData.word);

        successCount++;
      } catch (error) {
        errors.push(`单词 "${wordData.word}": ${error instanceof Error ? error.message : '未知错误'}`);
        errorCount++;
      }
    }

    return NextResponse.json({
      message: '导入完成',
      successCount,
      errorCount,
      errors: errors.slice(0, 10)
    });

  } catch (error) {
    console.error('确认导入失败:', error);
    return NextResponse.json(
      { 
        error: '确认导入失败',
        details: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    );
  }
}