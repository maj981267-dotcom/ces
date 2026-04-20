import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import Papa from 'papaparse';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: '请选择CSV文件' },
        { status: 400 }
      );
    }

    // 检查文件类型
    if (!file.name.endsWith('.csv')) {
      return NextResponse.json(
        { error: '请上传CSV格式文件' },
        { status: 400 }
      );
    }

    // 读取文件内容
    const text = await file.text();
    
    // 使用 papaparse 解析 CSV
    const parseResult = Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
      transform: (value) => value.trim()
    });

    if (parseResult.errors.length > 0) {
      console.log('Papa Parse 错误:', parseResult.errors);
    }

    const csvData = parseResult.data as any[];
    console.log('解析到的数据行数:', csvData.length);
    console.log('第一行数据:', csvData[0]);

    const parsedWords: any[] = [];
    const errors: string[] = [];

    for (let i = 0; i < csvData.length; i++) {
      try {
        const rowData = csvData[i];
        const wordData: any = { rowNumber: i + 2 };

        // 处理每个字段
        Object.keys(rowData).forEach((header) => {
          const value = rowData[header];
          
          // 处理JSON字段
          if (['common_meanings', 'uncommon_meanings', 'english_examples', 'synonyms', 'antonyms', 'derivatives', 'prefixes', 'roots', 'collocations', 'confusing_words', 'confusable_words', 'context'].includes(header)) {
            try {
              if (value && value !== '') {
                console.log(`解析字段 ${header}:`, value);
                wordData[header] = JSON.parse(value);
              } else {
                wordData[header] = null;
              }
            } catch (e) {
              console.error(`解析JSON失败 ${header}:`, value, e);
              wordData[header] = null;
            }
          } else {
            wordData[header] = value || null;
          }
        });

        if (!wordData.word) {
          errors.push(`第${i + 2}行：单词字段不能为空`);
          continue;
        }

        // 检查数据库中是否已存在该单词
        const existingWordResult = await query('SELECT word FROM words WHERE word = ?', [wordData.word]);
        
        const isDuplicate = existingWordResult && 
                           Array.isArray(existingWordResult) && 
                           existingWordResult.length > 0;
        
        wordData.isDuplicate = isDuplicate;
        parsedWords.push(wordData);

      } catch (error) {
        errors.push(`第${i + 2}行：${error instanceof Error ? error.message : '未知错误'}`);
      }
    }

    const duplicateCount = parsedWords.filter(word => word.isDuplicate).length;

    return NextResponse.json({
      message: '文件解析完成',
      parsedWords,
      totalWords: parsedWords.length,
      duplicateCount,
      errors: errors.slice(0, 10),
      needConfirmation: duplicateCount > 0
    });

  } catch (error) {
    console.error('解析失败:', error);
    return NextResponse.json(
      { 
        error: '解析失败',
        details: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    );
  }
}