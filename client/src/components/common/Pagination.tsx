import React from "react";
import { LeftOutlined, RightOutlined } from "@ant-design/icons"; 
interface PaginationProps {
  currentPage: number;                 
  totalItems: number;                  
  pageSize: number;                 
  onPageChange: (page: number) => void; 
}
const PaginationAntd: React.FC<PaginationProps> = ({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
}) => {
  const totalPages = Math.ceil(totalItems / pageSize);  
  const getPages = () => {
    const pages: number[] = [];
    const start = Math.max(1, currentPage - 1);        
    const end = Math.min(totalPages, currentPage + 1); 
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };
  return (
  <div 
    style={{ 
      display: "flex",           
      justifyContent: "flex-end",
      gap: 8,                     
      marginTop: 20              
    }}
  >
    {/* Nút Previous */}
    <button
      onClick={() => onPageChange(currentPage - 1)} 
      disabled={currentPage === 1}                  
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

    {/* Các nút số trang */}
    {getPages().map((page) => (
      <button
        key={page}
        onClick={() => onPageChange(page)}
        style={{
          padding: "4px 12px",
          border: "none",
          background: page === currentPage ? "#1890ff" : "transparent", 
          color: page === currentPage ? "#fff" : "#000",               
          cursor: "pointer",
          borderRadius: 4,
        }}
      >
        {page} {/* Hiển thị số trang */}
      </button>
    ))}

    {/* Nút Next */}
    <button
      onClick={() => onPageChange(currentPage + 1)} 
      disabled={currentPage === totalPages}        
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
// /Pagination là cách chia danh sách dài thành các trang nhỏ, gồm nút Previous/Next và số trang gần trang hiện tại, khi click sẽ gọi onPageChange cập nhật currentPage để re-render danh sách và highlight trang hiện tại; tổng số trang tính bằng Math.ceil(totalItems/pageSize), nút Previous/Next disable khi ở đầu/cuố