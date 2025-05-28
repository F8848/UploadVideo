"use client"
import { useEffect, useState } from "react";

export default function VideoList() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteSuccess, setDeleteSuccess] = useState("");

  useEffect(() => {
    fetch("/api/cvideo?meta=1")
      .then((res) => res.json())
      .then((data) => {
        if (data.videos && data.videos.length > 0) {
          setVideos(
            data.videos.sort((a, b) => new Date(a.mtime) - new Date(b.mtime))
          );
        } else {
          setVideos([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError("加载失败");
        setLoading(false);
      });
  }, []);

  // 删除视频
  const handleDelete = async (filename) => {
    if (!window.confirm(`确定要删除 ${filename} 吗？`)) return;
    try {
      const res = await fetch(`/api/cvideo?filename=${encodeURIComponent(filename)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok) {
        setDeleteSuccess('删除成功');
        setTimeout(() => setDeleteSuccess(''), 2000);
        // 自动刷新页面（重新获取视频列表）
        fetch("/api/cvideo?meta=1")
          .then((res) => res.json())
          .then((data) => {
            if (data.videos && data.videos.length > 0) {
              setVideos(
                data.videos.sort((a, b) => new Date(a.mtime) - new Date(b.mtime))
              );
            } else {
              setVideos([]);
            }
          });
      } else {
        alert(data.error || '删除失败');
      }
    } catch (err) {
      alert('删除失败');
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8 relative bg-gradient-to-br from-blue-50 via-pink-50 to-yellow-50 overflow-hidden">
      <h1 className="text-4xl sm:text-5xl font-extrabold mb-10 drop-shadow-xl text-blue-700 tracking-tight">视频列表</h1>
      {deleteSuccess && <p className="text-green-600 text-lg mb-4 font-bold animate-bounce">{deleteSuccess}</p>}
      {loading && <p className="text-lg sm:text-2xl text-blue-500 font-semibold animate-pulse">加载中...</p>}
      {error && <p className="text-red-500 text-lg sm:text-xl font-bold animate-shake">{error}</p>}
      {!loading && !error && (
        videos.length > 0 ? (
          <div className="relative w-full max-w-6xl">
            <ul className={
              videos.length === 1
                ? "flex justify-center items-center"
                : "grid grid-cols-1 sm:grid-cols-3 gap-8"
            }>
              {videos.map((video) => (
                <li
                  key={video.name}
                  className={
                    videos.length === 1
                      ? "flex flex-col items-center justify-center p-0 sm:p-0 rounded-2xl overflow-hidden border-0 w-full sm:w-[400px]"
                      : "flex flex-col items-center justify-center p-0 sm:p-0 rounded-2xl overflow-hidden border-0"
                  }
                >
                  <div
                    className={
                      videos.length === 1
                        ? "w-full aspect-video flex items-center justify-center border border-gray-300 rounded-2xl shadow-inner overflow-hidden bg-white/90 relative sm:w-[400px]"
                        : "w-full aspect-video flex items-center justify-center border border-gray-300 rounded-2xl shadow-inner overflow-hidden bg-white/90 relative"
                    }
                  >
                    <video
                      className="w-full h-auto block rounded-2xl bg-black"
                      controls
                      src={`/videos/${encodeURIComponent(video.name)}`}
                      style={{ aspectRatio: '16/9' }}
                    />
                    <button
                      onClick={() => handleDelete(video.name)}
                      className="absolute top-2 right-2 px-3 py-1 rounded bg-red-600 text-white text-sm font-semibold shadow hover:bg-red-700 transition-colors z-10"
                    >
                      删除
                    </button>
                  </div>
                  <div className="mt-2 flex flex-col items-center gap-1">
                    <span className="text-base font-bold text-blue-800 truncate max-w-full px-2 text-center drop-shadow-md bg-gradient-to-r from-blue-100 via-pink-100 to-yellow-100 rounded-lg py-1 shadow font-mono tracking-wide">{video.name}</span>
                    <span className="text-xs text-gray-600 italic tracking-wide bg-yellow-100 rounded px-2 py-0.5 shadow-sm font-sans mt-1">上传时间：{new Date(video.mtime).toLocaleString()}</span>
                  </div>
                </li>
              ))}
            </ul>
            <a
              href="/"
              className="block mx-auto mt-8 px-6 py-3 rounded-lg bg-blue-500 text-white text-lg font-semibold shadow hover:bg-blue-700 transition-colors z-20 w-max"
              style={{position: 'static'}}
            >
              返回上传视频
            </a>
          </div>
        ) : (
          <p className="text-lg sm:text-xl text-gray-500 italic font-semibold mt-10">暂无视频，快去上传吧！</p>
        )
      )}
    </main>
  );
}
