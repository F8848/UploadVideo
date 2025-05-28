"use client"
import { useEffect, useRef, useState } from "react";

export default function UploadVideo() {
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [selectedFileName, setSelectedFileName] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const fileInputRef = useRef(null);

  const handleUpload = async (e) => {
    e.preventDefault();
    setSuccess("");
    setError("");
    const file = fileInputRef.current.files[0];
    if (!file) {
      setError("请选择要上传的视频文件");
      return;
    }
    const formData = new FormData();
    formData.append("video", file);
    setUploading(true);
    try {
      const res = await fetch("/api/cvideo", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess("上传成功！");
        fileInputRef.current.value = "";
        setSelectedFileName("");
        setPreviewUrl("");
      } else {
        setError(data.error || "上传失败");
      }
    } catch (err) {
      setError("上传失败");
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = () => {
    const file = fileInputRef.current.files[0];
    setSelectedFileName(file ? file.name : "");
    setError("");
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl("");
    }
  };

  const handleRemovePreview = () => {
    setPreviewUrl("");
    setSelectedFileName("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8 bg-gradient-to-br from-blue-100 via-pink-100 to-yellow-100 relative overflow-hidden">
      <section className="w-full max-w-lg bg-white/95 p-8 rounded-2xl shadow-xl border border-gray-200 backdrop-blur-md flex flex-col gap-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2 text-center">上传视频</h1>
        <form onSubmit={handleUpload} className="flex flex-col gap-6">
          <label className="block">
            <span className="sr-only">选择视频文件</span>
            <input
              type="file"
              accept="video/mp4,video/*"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileChange}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              className="mb-4 px-6 py-3 rounded-lg bg-gradient-to-r from-pink-500 via-orange-400 to-yellow-400 text-white text-lg font-semibold shadow hover:from-pink-600 hover:to-yellow-500 transition-colors w-full"
            >
              选择视频文件
            </button>
          </label>
          {/* 文件名显示和预览 */}
          {selectedFileName && (
            <div className="flex flex-col gap-2 mb-2">
              <span className="text-gray-700 text-base font-semibold">已选择：{selectedFileName}</span>
              {previewUrl && (
                <div className="relative w-full flex flex-col items-center">
                  <video src={previewUrl} controls className="w-full rounded shadow max-h-64 bg-black border border-gray-200" style={{aspectRatio:'16/9'}} />
                  <button
                    type="button"
                    onClick={handleRemovePreview}
                    className="absolute top-2 right-2 px-3 py-1 rounded bg-red-600 text-white text-xs font-semibold shadow hover:bg-red-700 transition-colors"
                  >
                    删除预览视频
                  </button>
                </div>
              )}
            </div>
          )}
          <button
            type="submit"
            disabled={uploading}
            className="px-6 py-3 rounded-lg bg-blue-600 text-white text-lg font-semibold shadow hover:bg-blue-700 transition-colors disabled:opacity-60 w-full"
          >
            {uploading ? "上传中..." : "上传视频"}
          </button>
          {success && <p className="text-green-600 text-center font-semibold">{success}</p>}
          {error && <p className="text-red-500 text-center font-semibold">{error}</p>}
        </form>
        <div className="flex flex-col items-center gap-4 mt-6">
          <span className="text-xl font-bold text-blue-700 tracking-wide">视频上传中心</span>
          <a
            href="/videos"
            className="px-4 py-2 rounded-lg bg-blue-600 text-white text-base font-semibold shadow hover:bg-blue-700 transition-colors"
          >
            查看列表视频
          </a>
        </div>
      </section>
      {/* 页脚 */}
      <footer className="w-full max-w-2xl mx-auto mt-16 text-center text-gray-400 text-sm pb-2">
        &copy; {new Date().getFullYear()} 视频上传中心. Powered by Next.js
      </footer>
    </main>
  );
}
