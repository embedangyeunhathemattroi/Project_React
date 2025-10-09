// ========================== IMPORT CÁC THƯ VIỆN CẦN THIẾT ==========================
import React from "react";
import axios from "axios"; // Dùng để gọi API
import "./FlashCardPage.css";
import PaginationAntd from "../../components/common/Pagination"; // Component phân trang tùy chỉnh
import Footer from "../../components/common/Footer"; // Component chân trang
import FlashCard from "../../components/UI/FlashCard"; // Component hiển thị thẻ flashcard
import Swal from "sweetalert2"; // Thư viện hiển thị thông báo đẹp mắt

// ========================== KHAI BÁO CÁC INTERFACE (KIỂU DỮ LIỆU) ==========================

// Định nghĩa kiểu cho 1 từ vựng
interface Vocab {
  id: number;
  word: string;
  meaning: string;
  categoryId: number;
  topic: string;
  isLearned: boolean; // true nếu từ đã được học
}

// Định nghĩa kiểu cho danh mục (category)
interface Category {
  id: number;
  name: string;
  topic: string;
}

// Định nghĩa kiểu cho toàn bộ state của component
interface State {
  vocabs: Vocab[];              // Danh sách từ vựng
  categories: Category[];       // Danh sách danh mục
  currentIndex: number;         // Vị trí hiện tại của thẻ đang học
  filterCategoryId: number | "All"; // ID danh mục đang được lọc (hoặc "All")
  flipped: boolean;             // Trạng thái lật thẻ (true = hiện nghĩa)
  loading: boolean;             // Cờ kiểm tra đang tải dữ liệu
  error: string | null;         // Lưu lỗi (nếu có)
  currentPage: number;          // Trang hiện tại của bảng danh sách
  pageSize: number;             // Số phần tử mỗi trang
}

// ========================== KHAI BÁO CLASS COMPONENT ==========================
class FlashCardPage extends React.Component<{}, State> {
  // Khởi tạo state mặc định
  state: State = {
    vocabs: [],
    categories: [],
    currentIndex: 0,
    filterCategoryId: "All",
    flipped: false,
    loading: false,
    error: null,
    currentPage: 1,
    pageSize: 5,
  };

  // ========================== LẤY DỮ LIỆU KHI COMPONENT MOUNT ==========================
  componentDidMount() {
    this.fetchData(); // Gọi API khi trang vừa load
  }

  // Hàm gọi API để lấy danh sách từ vựng và danh mục
  fetchData = async () => {
    this.setState({ loading: true }); // Hiển thị loading khi đang tải
    try {
      // Gọi 2 API song song bằng Promise.all để tối ưu hiệu suất
      const [vocabsRes, categoriesRes] = await Promise.all([
        axios.get<Vocab[]>("http://localhost:8080/vocabs"),
        axios.get<Category[]>("http://localhost:8080/categories"),
      ]);
      // Lưu dữ liệu vào state
      this.setState({
        vocabs: vocabsRes.data,
        categories: categoriesRes.data,
        loading: false,
      });
    } catch (err: any) {
      // Nếu lỗi -> hiển thị lỗi và tắt loading
      this.setState({ error: err.message || "Failed to fetch data", loading: false });
    }
  };

  // ========================== CÁC HÀM XỬ LÝ HÀNH ĐỘNG ==========================

  // Lật thẻ flashcard (hiện nghĩa hoặc từ)
  handleFlip = () => {
    this.setState({ flipped: !this.state.flipped });
  };

  // Chuyển sang từ kế tiếp
  handleNext = () => {
    // Lọc ra các từ CHƯA học
    const filtered = this.getFilteredVocabs().filter(v => !v.isLearned);
    // Nếu đang ở cuối danh sách
    if (this.state.currentIndex >= filtered.length - 1) {
      if (filtered.length > 0) {
        // Còn từ chưa học -> nhắc nhở
        Swal.fire({
          icon: "info",
          title: "Bạn vẫn chưa học hết!",
          text: `Bạn còn ${filtered.length} từ chưa học. Cố gắng lần sau nhé 🚀`,
        });
      } else {
        // Tất cả đã học xong
        Swal.fire({
          title: "Chúc mừng 🎉",
          text: "Bạn đã học xong toàn bộ bài!",
          imageUrl: "https://media.giphy.com/media/3o6Zt481isNVuQI1l6/giphy.gif",
          imageWidth: 400,
          imageHeight: 200,
          imageAlt: "Celebration",
        });
      }
    } else {
      // Nếu chưa đến cuối -> sang từ kế tiếp
      this.setState(prev => ({
        currentIndex: Math.min(prev.currentIndex + 1, filtered.length - 1),
        flipped: false, // Reset lại trạng thái thẻ (hiện mặt trước)
      }));
    }
  };

  // Quay lại từ trước đó
  handlePrevious = () => {
    if (this.state.currentIndex === 0) {
      Swal.fire({
        icon: "warning",
        title: "Cảnh báo",
        text: "Bạn đang ở từ đầu tiên rồi!",
      });
      return;
    }
    this.setState(prev => ({
      currentIndex: Math.max(prev.currentIndex - 1, 0),
      flipped: false,
    }));
  };

  // Đánh dấu từ hiện tại là "đã học"
  handleMarkLearned = () => {
    const filtered = this.getFilteredVocabs().filter(v => !v.isLearned);
    const current = filtered[this.state.currentIndex];

    if (current) {
      this.setState(prev => {
        // Cập nhật trạng thái isLearned = true cho từ hiện tại
        const updatedVocabs = prev.vocabs.map(v =>
          v.id === current.id ? { ...v, isLearned: true } : v
        );

        // Tính lại danh sách chưa học sau khi cập nhật
        const unlearned = updatedVocabs.filter(v =>
          !v.isLearned &&
          (prev.filterCategoryId === "All" || v.categoryId === prev.filterCategoryId)
        );

        // Đặt lại currentIndex hợp lý (nếu còn từ chưa học)
        const newIndex = Math.min(prev.currentIndex, Math.max(unlearned.length - 1, 0));

        // Nếu học hết toàn bộ
        if (unlearned.length === 0) {
          Swal.fire({
            title: "Tuyệt vời 🎇",
            text: "Bạn đã học hết tất cả từ!",
            imageUrl: "https://media.giphy.com/media/111ebonMs90YLu/giphy.gif",
            imageWidth: 400,
            imageHeight: 200,
            imageAlt: "Fireworks",
          });
        }

        return {
          vocabs: updatedVocabs,
          currentIndex: newIndex,
        };
      });
    }
  };

  // Khi người dùng chọn thay đổi danh mục
  handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value === "All" ? "All" : Number(e.target.value);
    // Reset index, trang, trạng thái flip khi đổi danh mục
    this.setState({ filterCategoryId: value, currentIndex: 0, flipped: false, currentPage: 1 });
  };

  // ========================== HÀM XỬ LÝ DỮ LIỆU HIỂN THỊ ==========================

  // Lấy danh sách từ theo danh mục được chọn
  getFilteredVocabs = () => {
    const { vocabs, filterCategoryId } = this.state;
    if (filterCategoryId === "All") return vocabs;
    return vocabs.filter(v => v.categoryId === filterCategoryId);
  };

  // Lấy danh sách từ theo trang (phân trang)
  getPagedVocabs = () => {
    const { currentPage, pageSize } = this.state;
    const filtered = this.getFilteredVocabs().filter(v => !v.isLearned);
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return filtered.slice(start, end);
  };

  // ========================== HÀM RENDER GIAO DIỆN ==========================
  render() {
    const { categories, currentIndex, flipped, loading, error, currentPage, pageSize } = this.state;

    // Lấy danh sách từ đã lọc
    const filteredVocabs = this.getFilteredVocabs();
    const unlearnedVocabs = filteredVocabs.filter(v => !v.isLearned);

    // Từ đang hiển thị trong flashcard
    const currentVocab = unlearnedVocabs[currentIndex] || null;

    // Dữ liệu hiển thị trên bảng (phân trang)
    const pagedVocabs = this.getPagedVocabs();

    // Tính tiến độ học (%)
    const totalUnlearned = unlearnedVocabs.length;
    const learnedCount = filteredVocabs.length - totalUnlearned;
    const progressPercent =
      filteredVocabs.length === 0 ? 0 : (learnedCount / filteredVocabs.length) * 100;

    // Nếu đang loading
    if (loading) return <div className="container mt-5">Loading...</div>;
    // Nếu lỗi
    if (error) return <div className="container mt-5 text-danger">{error}</div>;

    // ========================== JSX TRẢ VỀ ==========================
    return (
      <div className="d-flex flex-column min-vh-100">
        <div className="container mt-5 flex-grow-1" style={{ paddingBottom: "200px" }}>
          <h3>Flashcard Learning</h3>

          {/* ======== FILTER DANH MỤC ======== */}
          <select
            className="form-select mb-3"
            value={this.state.filterCategoryId}
            onChange={this.handleFilterChange}
          >
            <option value="All">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* ======== FLASHCARD HIỂN THỊ TỪ HIỆN TẠI ======== */}
          <div className="flashcard-container mb-3">
            {currentVocab ? (
              <FlashCard
                word={currentVocab.word}
                meaning={currentVocab.meaning}
                flipped={flipped}
                onFlip={this.handleFlip}
                width="100%"
                height="300px"
              />
            ) : (
              // Nếu không có từ
              <div
                style={{
                  width: "100%",
                  height: "300px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "white",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                }}
              >
                <h5>No words available</h5>
              </div>
            )}
          </div>

          {/* ======== CÁC NÚT ĐIỀU KHIỂN ======== */}
          <div className="mb-3 d-flex justify-content-center gap-3 flex-wrap">
            <button
              className="btn btn-primary btn-lg"
              onClick={this.handlePrevious}
              disabled={currentIndex === 0}
            >
              Previous
            </button>
            <button
              className="btn btn-success btn-lg"
              onClick={this.handleMarkLearned}
              disabled={!currentVocab}
            >
              Mark as Learned
            </button>
            <button
              className="btn btn-primary btn-lg"
              onClick={this.handleNext}
              disabled={currentIndex >= totalUnlearned - 1}
            >
              Next
            </button>
          </div>

          {/* ======== THANH TIẾN TRÌNH ======== */}
          <div className="mb-3">
            <label>Progress</label>
            <div className="progress">
              <div
                className="progress-bar"
                role="progressbar"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <small>
              {learnedCount}/{filteredVocabs.length}
            </small>
          </div>

          {/* ======== DANH SÁCH TỪ VỰNG (BẢNG) ======== */}
          <h5>Word List (Unlearned)</h5>
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>Word</th>
                <th>Meaning</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {pagedVocabs.map(v => (
                <tr key={v.id}>
                  <td>{v.word}</td>
                  <td>{v.meaning}</td>
                  <td>{v.isLearned ? "Learned" : "Not Learned"}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* ======== PHÂN TRANG ======== */}
          <div className="mb-5">
            <PaginationAntd
              currentPage={currentPage}
              totalItems={unlearnedVocabs.length}
              pageSize={pageSize}
              onPageChange={page => this.setState({ currentPage: page })}
            />
          </div>
        </div>

        {/* ======== CHÂN TRANG ======== */}
        <Footer />
      </div>
    );
  }
}

// ========================== EXPORT COMPONENT ==========================
export default FlashCardPage;
