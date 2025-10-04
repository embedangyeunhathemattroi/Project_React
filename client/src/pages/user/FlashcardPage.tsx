// FlashCardPage.tsx
import React from "react";
import axios from "axios";
import "./FlashCardPage.css"; 
import PaginationAntd from "../../components/common/Pagination";
import Footer from "../../components/common/Footer";
import FlashCard from "../../components/UI/FlashCard";
import Swal from "sweetalert2";

interface Vocab {
  id: number;
  word: string;
  meaning: string;
  categoryId: number;
  topic: string;
  isLearned: boolean;
}

interface Category {
  id: number;
  name: string;
  topic: string;
}

interface State {
  vocabs: Vocab[];
  categories: Category[];
  currentIndex: number;
  filterCategoryId: number | "All";
  flipped: boolean;
  loading: boolean;
  error: string | null;
  currentPage: number;
  pageSize: number;
}

class FlashCardPage extends React.Component<{}, State> {
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

  componentDidMount() {
    this.fetchData();
  }

  fetchData = async () => {
    this.setState({ loading: true });
    try {
      const [vocabsRes, categoriesRes] = await Promise.all([
        axios.get<Vocab[]>("http://localhost:8080/vocabs"),
        axios.get<Category[]>("http://localhost:8080/categories"),
      ]);
      this.setState({
        vocabs: vocabsRes.data,
        categories: categoriesRes.data,
        loading: false,
      });
    } catch (err: any) {
      this.setState({ error: err.message || "Failed to fetch data", loading: false });
    }
  };

  handleFlip = () => {
    this.setState({ flipped: !this.state.flipped });
  };

  handleNext = () => {
    const filtered = this.getFilteredVocabs().filter(v => !v.isLearned);
    if (this.state.currentIndex >= filtered.length - 1) {
      // Hết từ
      if (filtered.length > 0) {
        Swal.fire({
          icon: "info",
          title: "Bạn vẫn chưa học hết!",
          text: `Bạn còn ${filtered.length} từ chưa học. Cố gắng lần sau nhé 🚀`,
        });
      } else {
        // Học xong tất cả
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
      this.setState(prev => ({
        currentIndex: Math.min(prev.currentIndex + 1, filtered.length - 1),
        flipped: false,
      }));
    }
  };

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

  handleMarkLearned = () => {
    const filtered = this.getFilteredVocabs().filter(v => !v.isLearned);
    const current = filtered[this.state.currentIndex];
    if (current) {
      this.setState(prev => {
        const updatedVocabs = prev.vocabs.map(v =>
          v.id === current.id ? { ...v, isLearned: true } : v
        );
        const unlearned = updatedVocabs.filter(v => 
          !v.isLearned && (prev.filterCategoryId === "All" || v.categoryId === prev.filterCategoryId)
        );
        const newIndex = Math.min(prev.currentIndex, Math.max(unlearned.length - 1, 0));

        // Nếu học xong hết
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

  handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value === "All" ? "All" : Number(e.target.value);
    this.setState({ filterCategoryId: value, currentIndex: 0, flipped: false, currentPage: 1 });
  };

  getFilteredVocabs = () => {
    const { vocabs, filterCategoryId } = this.state;
    if (filterCategoryId === "All") return vocabs;
    return vocabs.filter(v => v.categoryId === filterCategoryId);
  };

  getPagedVocabs = () => {
    const { currentPage, pageSize } = this.state;
    const filtered = this.getFilteredVocabs().filter(v => !v.isLearned);
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return filtered.slice(start, end);
  };

  render() {
    const { categories, currentIndex, flipped, loading, error, currentPage, pageSize } = this.state;
    const filteredVocabs = this.getFilteredVocabs();
    const unlearnedVocabs = filteredVocabs.filter(v => !v.isLearned);
    const currentVocab = unlearnedVocabs[currentIndex] || null;
    const pagedVocabs = this.getPagedVocabs();

    const totalUnlearned = unlearnedVocabs.length;
    const learnedCount = filteredVocabs.length - totalUnlearned;
    const progressPercent = filteredVocabs.length === 0 ? 0 : (learnedCount / filteredVocabs.length) * 100;

    if (loading) return <div className="container mt-5">Loading...</div>;
    if (error) return <div className="container mt-5 text-danger">{error}</div>;

    return (
      <div className="d-flex flex-column min-vh-100">
        <div className="container mt-5 flex-grow-1" style={{ paddingBottom: "200px" }}>
          <h3>Flashcard Learning</h3>

          {/* Filter */}
          <select className="form-select mb-3" value={this.state.filterCategoryId} onChange={this.handleFilterChange}>
            <option value="All">All Categories</option>
            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
          </select>

          {/* Flashcard */}
          <div className="flashcard-container mb-3 d-flex justify-content-center">
            {currentVocab ? (
              <FlashCard
                word={currentVocab.word}
                meaning={currentVocab.meaning}
                flipped={flipped}
                onFlip={this.handleFlip}
                width="400px"
                height="250px"
              />
            ) : (
              <h5>No words available</h5>
            )}
          </div>

          {/* Buttons */}
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

          {/* Progress */}
          <div className="mb-3">
            <label>Progress</label>
            <div className="progress">
              <div
                className="progress-bar"
                role="progressbar"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <small>{learnedCount}/{filteredVocabs.length}</small>
          </div>

          {/* Word List */}
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

          {/* Pagination */}
          <div className="mb-5">
            <PaginationAntd
              currentPage={currentPage}
              totalItems={unlearnedVocabs.length}
              pageSize={pageSize}
              onPageChange={(page) => this.setState({ currentPage: page })}
            />
          </div>
        </div>

        <Footer />
      </div>
    );
  }
}

export default FlashCardPage;
