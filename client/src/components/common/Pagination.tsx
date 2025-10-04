import React from "react";
import { LeftOutlined, RightOutlined } from "@ant-design/icons"; // Icon cho prev/next

// Props cho component phân trang
interface PaginationProps {
  currentPage: number;                 // Trang hiện tại
  totalItems: number;                  // Tổng số item
  pageSize: number;                    // Số item trên 1 trang
  onPageChange: (page: number) => void; // Callback khi đổi trang
}

const PaginationAntd: React.FC<PaginationProps> = ({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
}) => {
  // Tính tổng số trang
  const totalPages = Math.ceil(totalItems / pageSize);

  // Lấy danh sách số trang hiển thị (ví dụ: currentPage ±1)
  const getPages = () => {
    const pages: number[] = [];
    const start = Math.max(1, currentPage - 1);        // Trang bắt đầu
    const end = Math.min(totalPages, currentPage + 1); // Trang kết thúc
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 20 }}>
      
      {/* Prev button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}       // Khi click, giảm trang
        disabled={currentPage === 1}                        // Disable nếu ở trang 1
        style={{
          borderRadius: "50%",
          width: 32,
          height: 32,
          border: "1px solid #1890ff",
          background: "#fff",
          cursor: currentPage === 1 ? "not-allowed" : "pointer",
        }}
      >
        <LeftOutlined />
      </button>

      {/* Pages */}
      {getPages().map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}              // Click vào số trang => gọi callback
          style={{
            padding: "4px 12px",
            border: "none",
            background: page === currentPage ? "#1890ff" : "transparent", // Highlight trang hiện tại
            color: page === currentPage ? "#fff" : "#000",
            cursor: "pointer",
            borderRadius: 4,
          }}
        >
          {page}
        </button>
      ))}

      {/* Next button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}      // Khi click, tăng trang
        disabled={currentPage === totalPages}             // Disable nếu ở trang cuối
        style={{
          borderRadius: "50%",
          width: 32,
          height: 32,
          border: "1px solid #1890ff",
          background: "#fff",
          cursor: currentPage === totalPages ? "not-allowed" : "pointer",
        }}
      >
        <RightOutlined />
      </button>
    </div>
  );
};

export default PaginationAntd;
