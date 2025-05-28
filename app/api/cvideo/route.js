'use server';
// This file is part of the Next.js application and handles the API route for fetching video files.
import fs from 'fs';
import path from 'path';
// 支持 meta=1 查询视频及其上传时间
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const withMeta = searchParams.get('meta') === '1';
  const videosDirectory = path.join(process.cwd(), 'public', 'videos');
  try {
    if (!fs.existsSync(videosDirectory)) {
      return new Response(JSON.stringify({ videos: [] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    const videoFiles = fs.readdirSync(videosDirectory);
    const filteredVideos = videoFiles.filter(file => file.endsWith('.mp4'));
    if (withMeta) {
      // 返回带有上传时间的元数据
      const videos = filteredVideos.map(name => {
        const stat = fs.statSync(path.join(videosDirectory, name));
        return { name, mtime: stat.mtime };
      });
      return new Response(JSON.stringify({ videos }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } else {
      return new Response(JSON.stringify({ videos: filteredVideos }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    return new Response(JSON.stringify({ videos: [], error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('video');
    if (!file) {
      return new Response(JSON.stringify({ error: '未收到视频文件' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    // 读取文件内容
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    // 确保 public/videos 目录存在
    const videosDir = path.join(process.cwd(), 'public', 'videos');
    if (!fs.existsSync(videosDir)) {
      fs.mkdirSync(videosDir, { recursive: true });
    }
    // 保存文件
    const filePath = path.join(videosDir, file.name);
    fs.writeFileSync(filePath, buffer);
    return new Response(JSON.stringify({ success: true, filename: file.name }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename');
    if (!filename) {
      return new Response(JSON.stringify({ error: '缺少文件名' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    const videosDir = path.join(process.cwd(), 'public', 'videos');
    const filePath = path.join(videosDir, filename);
    if (!fs.existsSync(filePath)) {
      return new Response(JSON.stringify({ error: '文件不存在' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    fs.unlinkSync(filePath);
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}