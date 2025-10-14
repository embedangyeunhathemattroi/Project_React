import React, { useEffect, useState } from "react"; 
import { Card, Select, Button, Radio, Progress, Table, Spin, Pagination, Modal, Input, Form, Row, Col } from "antd"; 
import Swal from "sweetalert2"; 
import Footer from "../../components/common/Footer"; 
import { fetchResults, type Result } from "../../stores/slices/resultSlice"; 
import { useAppDispatch, useAppSelector } from "../../hook/hooks"; 

const { Option } = Select; 
// ----- Định nghĩa kiểu dữ liệu câu hỏi -----
interface Question {
  id: number;         
  question: string;    
  options: string[];   // các lựa chọn
  answer: string;      // đáp án đúng
  category: string;    
}

// ----- Định nghĩa kiểu dữ liệu lưu câu trả lời -----
interface AnswerRecord {
  questionId: number; 
  selected: string;    // đáp án người dùng chọn
  correct: string;     // đáp án đúng
  isCorrect: boolean;  // đánh dấu đúng/sai
}

const QuizPage: React.FC = () => {
  const dispatch = useAppDispatch(); 
  const { results, loading } = useAppSelector(state => state.result); 
  const [questions, setQuestions] = useState<Question[]>([]); // danh sách câu hỏi
  const [selectedCategory, setSelectedCategory] = useState("All Categories"); // filter theo category
  const [quizStarted, setQuizStarted] = useState(false);   // trạng thái quiz đang chạy
  const [currentIndex, setCurrentIndex] = useState(0);     // index câu hỏi hiện tại
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null); // đáp án đang chọn
  const [answers, setAnswers] = useState<AnswerRecord[]>([]); // lưu tất cả câu trả lời trong quiz

  const [score, setScore] = useState(0);                 // điểm hiện tại
  const [quizFinished, setQuizFinished] = useState(false); // quiz đã kết thúc chưa
  const [currentPage, setCurrentPage] = useState(1);     // phân trang lịch sử quiz
  const pageSize = 5;                                    // số item trên 1 trang
  const [manageMode, setManageMode] = useState(false);   // chế độ quản lý câu hỏi

  const [modalVisible, setModalVisible] = useState(false); // modal thêm/sửa câu hỏi
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null); // question đang edit
  const [form] = Form.useForm();                          // form modal

  const [searchText, setSearchText] = useState("");       // filter theo text

  // ----- Lấy danh sách câu hỏi và kết quả quiz khi component mount -----
  useEffect(() => {
    const fetchQ = async () => {
      try {
        const res = await fetch("http://localhost:8080/question"); 
        const data = await res.json(); 
        setQuestions(data); // lưu câu hỏi vào state
      } catch (err) {
        console.error(err); 
      }
    };
    fetchQ(); 
    dispatch(fetchResults()); // load kết quả quiz từ redux
  }, [dispatch]);

  // ----- Filter câu hỏi theo category + search -----
  const filteredQuestions = questions.filter(q =>
    (selectedCategory === "All Categories" || q.category === selectedCategory) &&
    q.question.toLowerCase().includes(searchText.toLowerCase())
  );

  const answeredCount = answers.length;                   // số câu đã trả lời
  const totalQuestions = filteredQuestions.length;        // tổng số câu sau filter
  const quizProgress = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0; // % tiến độ quiz
  const currentAnswerRecord = answers.find(a => a.questionId === filteredQuestions[currentIndex]?.id); // lấy câu trả lời hiện tại nếu đã chọn

  // ----- Bắt đầu quiz -----
  const handleStartQuiz = () => {
    setQuizStarted(true);       // bật trạng thái quiz
    setCurrentIndex(0);         // bắt đầu từ câu đầu
    setSelectedAnswer(null);    // reset lựa chọn
    setAnswers([]);             // reset lịch sử trả lời
    setScore(0);                // reset điểm
    setQuizFinished(false);     // đánh dấu quiz chưa kết thúc
  };

  // ----- Quay lại câu trước -----
  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1); // giảm index câu hỏi

      // load đáp án cũ nếu câu trước đã trả lời
      const prevAnswer = answers.find(a => a.questionId === filteredQuestions[currentIndex - 1]?.id);
      setSelectedAnswer(prevAnswer?.selected || null); // nếu chưa trả lời, null
    }
  };

  // ----- Sang câu tiếp theo hoặc kết thúc quiz -----
  const handleNext = async () => {
    const currentQuestion = filteredQuestions[currentIndex];

    // nếu chưa chọn đáp án và quiz chưa finish => return
    if (!selectedAnswer && !quizFinished) return;

    const isCorrect = selectedAnswer === currentQuestion.answer; // kiểm tra đúng/sai
    if (!quizFinished && isCorrect) setScore(prev => prev + 1); // cộng điểm nếu đúng

    // lưu câu trả lời vào answers
    if (!quizFinished) {
      setAnswers(prev => [
        ...prev.filter(a => a.questionId !== currentQuestion.id), // xóa record cũ nếu có
        {
          questionId: currentQuestion.id,
          selected: selectedAnswer!,
          correct: currentQuestion.answer,
          isCorrect,
        }
      ]);
    }

    setSelectedAnswer(null); // reset lựa chọn để sang câu mới

    // nếu chưa phải câu cuối => next câu
    if (currentIndex < filteredQuestions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // câu cuối => finish quiz
      setQuizFinished(true);
      setQuizStarted(false);

      const finalScore = score + (isCorrect ? 1 : 0); // tính điểm cuối
      const percent = Math.round((finalScore / totalQuestions) * 100); // tính % đúng

      // Hiển thị kết quả quiz + review tất cả câu trả lời
      Swal.fire({
        title: percent >= 70 ? "Great Job! " : "Keep Trying! ",
        html: `
          <p>You scored ${finalScore} / ${totalQuestions} (${percent}%)</p>
          <h4>Answer Review:</h4>
          <ul>
            ${answers.map(a => {
              const q = filteredQuestions.find(q => q.id === a.questionId);
              return `<li><strong>${q?.question}</strong><br/>
                      Your answer: ${a.selected} ${a.isCorrect ? "✔" : "✖"}<br/>
                      Correct: ${a.correct}</li>`;
            }).join("")}
            <li><strong>${currentQuestion.question}</strong><br/>
            Your answer: ${selectedAnswer} ${isCorrect ? "&#10004;" : "&#10006;"}
<br/>
            Correct: ${currentQuestion.answer}</li>
          </ul>
        `,
        icon: percent >= 70 ? "success" : "warning",
        width: 600
      });

      // Lưu kết quả quiz vào backend
      try {
        await fetch("http://localhost:8080/results", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            date: new Date().toISOString(),
            category: selectedCategory,
            score: finalScore,
            total: totalQuestions,
            answers: [
              ...answers,
              { questionId: currentQuestion.id, selected: selectedAnswer!, correct: currentQuestion.answer, isCorrect }
            ]
          })
        });
        dispatch(fetchResults()); // reload redux history
      } catch (err) {
        console.error("Failed to save result:", err);
      }
    }
  };

  // ----- Thêm câu hỏi mới -----
  const handleAddQuestion = () => {
    setEditingQuestion(null);   // không chỉnh sửa, thêm mới
    form.resetFields();         // reset form
    setModalVisible(true);      // mở modal
  };

  // ----- Chỉnh sửa câu hỏi -----
  const handleEditQuestion = (question: Question) => {
    setEditingQuestion(question); // lưu question đang edit
    form.setFieldsValue({         // set giá trị vào form
      question: question.question,
      category: question.category,
      answer: question.answer,
      options: question.options.join(", ")
    });
    setModalVisible(true);        // mở modal
  };

  // ----- Xóa câu hỏi -----
  const handleDeleteQuestion = (id: number) => {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to delete this question?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!"
    }).then(result => {
      if (result.isConfirmed) {
        setQuestions(prev => prev.filter(q => q.id !== id)); // xóa question khỏi state
        Swal.fire("Deleted!", "Question has been deleted.", "success");
      }
    });
  };
// ----- Hàm xử lý khi bấm OK trên Modal thêm/sửa câu hỏi -----
const handleModalOk = () => {
  // validate các trường trong form trước khi xử lý
  form.validateFields().then(values => {
    const newQuestionText = values.question.trim(); // lấy text câu hỏi và loại bỏ khoảng trắng thừa
    const newCategory = values.category.trim();    // lấy category và trim

    // ----- Kiểm tra câu hỏi trùng trong cùng category -----
    const exists = questions.some(q =>
      q.question.trim().toLowerCase() === newQuestionText.toLowerCase() && // cùng nội dung câu hỏi
      q.category === newCategory &&                                        // cùng category
      (!editingQuestion || q.id !== editingQuestion.id)                     // nếu đang edit thì bỏ qua question đang edit
    );

    // nếu tồn tại câu hỏi trùng => thông báo và không thêm
    if (exists) {
      Swal.fire({
        icon: "warning",
        title: "Oops...",
        text: `Question already exists in category "${newCategory}"!`,
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });
      return; // thoát hàm, không tiếp tục thêm
    }

    // ----- Tạo object question mới hoặc update nếu đang edit -----
    const newQuestion: Question = {
      id: editingQuestion ? editingQuestion.id : Date.now(), // dùng id cũ nếu edit, hoặc timestamp mới nếu thêm
      question: newQuestionText,
      category: newCategory,
      answer: values.answer,                                 // đáp án đúng
      options: values.options.split(",").map((o: string) => o.trim()) // tách options từ chuỗi và trim
    };

    // nếu đang edit
    if (editingQuestion) {
      setQuestions(prev => prev.map(q => q.id === editingQuestion.id ? newQuestion : q)); // update question trong state
      Swal.fire("Updated!", "Question has been updated.", "success");                     // thông báo success
    } else {
      // thêm mới
      setQuestions(prev => [...prev, newQuestion]); // push question mới vào state
      Swal.fire("Added!", "Question has been added.", "success"); // thông báo success
    }

    setModalVisible(false); // đóng modal sau khi thêm/sửa xong
  });
};

// ----- Render component QuizPage -----
return (
  <div style={{ maxWidth: '92%',maxHeight: '100%', padding: 10, margin: "20px auto", minHeight: "80vh", display: "flex", flexDirection: "column" }}>
    {/* Header: title + Start Quiz + Manage Questions */}
    <Row style={{ marginBottom: 20, display: "flex", alignItems: "center" }}>
      <Col flex="auto"><h2><strong>Vocabulary Quiz</strong></h2></Col> {/* title */}
      <Col>
        {!quizStarted && (
          <>
            {/* Nút bắt đầu quiz */}
            <Button type="primary" onClick={handleStartQuiz} style={{ marginRight: 10 }}>Start Quiz</Button>
            {/* Nút chuyển qua chế độ quản lý câu hỏi */}
            <Button onClick={() => setManageMode(prev => !prev)}>
              {manageMode ? "Back to Quiz" : "Manage Questions"}
            </Button>
          </>
        )}
      </Col>
    </Row>

    {/* ----- Manage Mode: thêm/sửa/xóa câu hỏi ----- */}
    {manageMode && (
      <Card style={{ marginBottom: 20 }}>
        <Row gutter={16} align="middle">
          <Col flex="1">
            {/* Input tìm kiếm câu hỏi */}
            <Input
              placeholder="Search question..."
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
            />
          </Col>
          <Col>
            {/* Select filter category */}
            <Select
              value={selectedCategory}
              style={{ width: 200 }}
              onChange={value => setSelectedCategory(value)}
            >
              <Option value="All Categories">All Categories</Option>
              {/* Lấy danh sách category duy nhất từ questions */}
              {[...new Set(questions.map(q => q.category))].map(cat => (
                <Option key={cat} value={cat}>{cat}</Option>
              ))}
            </Select>
          </Col>
          <Col>
            {/* Nút thêm câu hỏi mới */}
            <Button type="primary" onClick={handleAddQuestion}>Add Question</Button>
          </Col>
        </Row>

        {/* Table hiển thị câu hỏi */}
        <Table
          style={{ marginTop: 30 }}
          dataSource={filteredQuestions} // dữ liệu filter theo category + search
          rowKey="id"
          columns={[
            { title: "Question", dataIndex: "question", key: "question" }, // cột question
            { title: "Category", dataIndex: "category", key: "category" }, // cột category
            {
              title: "Actions",
              key: "actions",
              render: (_, record: Question) => (
                <div style={{ display: "flex", gap: 10 }}>
                  {/* Nút edit */}
                  <Button onClick={() => handleEditQuestion(record)}>Edit</Button>
                  {/* Nút delete */}
                  <Button danger onClick={() => handleDeleteQuestion(record.id)}>Delete</Button>
                </div>
              )
            }
          ]}
          pagination={{ pageSize }} // phân trang
        />

        {/* Modal thêm/sửa câu hỏi */}
        <Modal
          title={editingQuestion ? "Edit Question" : "Add Question"} // title khác nhau
          open={modalVisible}
          onOk={handleModalOk}       // khi bấm OK gọi handleModalOk
          onCancel={() => setModalVisible(false)}
          okText={editingQuestion ? "Update" : "Add"} // text nút OK
        >
          <Form form={form} layout="vertical">
            <Form.Item name="question" label="Question" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="category" label="Category" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="options" label="Options (comma separated)" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="answer" label="Correct Answer" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    )}

    {/* ----- Quiz Mode: hiển thị quiz ----- */}
    {!manageMode && (
      <>
        {/* Select filter category */}
        <Select
          style={{ width: "100%", marginBottom: 20 }}
          value={selectedCategory}
          onChange={value => setSelectedCategory(value)}
          disabled={quizStarted} // disable khi đang quiz
        >
          <Option value="All Categories">All Categories</Option>
          {[...new Set(questions.map(q => q.category))].map(cat => (
            <Option key={cat} value={cat}>{cat}</Option>
          ))}
        </Select>

        {/* Progress bar */}
        {quizStarted && (
          <Progress percent={quizProgress} style={{ marginBottom: 20 }} />
        )}

        {/* Hiển thị câu hỏi */}
        {filteredQuestions.length > 0 && (quizStarted || quizFinished) && (
          <Card style={{ width: "100%", boxShadow: "0 4px 8px rgba(0,0,0,0.1)", marginBottom: 20 }}>
            <h3 style={{
              backgroundColor: selectedAnswer || currentAnswerRecord ? "#e6f7e6" : "transparent",
              padding: "5px 10px",
              borderRadius: 4
            }}>
              {filteredQuestions[currentIndex].question} {/* câu hỏi hiện tại */}
            </h3>
            <Radio.Group
              value={selectedAnswer || currentAnswerRecord?.selected || null} // đáp án đang chọn hoặc đã trả lời trước
              onChange={e => setSelectedAnswer(e.target.value)} // khi chọn option
              style={{ width: "100%" }}
            >
              {filteredQuestions[currentIndex].options.map(opt => {
                const record = answers.find(a => a.questionId === filteredQuestions[currentIndex].id); // tìm record đã trả lời
                const isSelected = selectedAnswer === opt || record?.selected === opt; // đánh dấu đang chọn
                const correct = record?.correct === opt;   // kiểm tra option đúng
                const wrong = record && record.selected === opt && !record.isCorrect; // kiểm tra option sai

                return (
                  <Radio
                    key={opt}
                    value={opt}
                    style={{
                      display: "block",
                      margin: "8px 0",
                      padding: 5,
                      borderRadius: 4,
                      backgroundColor: correct ? "#d9f7be" : wrong ? "#ffccc7" : (isSelected ? "#f0f9ff" : "transparent")
                    }}
                    disabled={quizFinished || !!record} // disable nếu quiz finish hoặc đã trả lời
                  >
                    {opt} {/* hiển thị option */}
                  </Radio>
                );
              })}
            </Radio.Group>

            {/* Hiển thị điểm khi quiz finish */}
            {quizFinished && (
              <div style={{ marginTop: 10, fontWeight: "bold" }}>
                Bạn đạt {score}/{filteredQuestions.length} câu đúng
              </div>
            )}
          </Card>
        )}

        {/* Nút Prev / Next */}
        {quizStarted && (
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
            <Button onClick={handlePrev} disabled={currentIndex === 0}>Prev</Button>
            <Button type="primary" onClick={handleNext}>
              {currentIndex < filteredQuestions.length - 1 ? "Next" : "Finish"} {/* Next hoặc Finish */}
            </Button>
          </div>
        )}

        {/* Quiz History */}
        <h3>Quiz History</h3>
        {loading ? <Spin /> : (
          <>
            <Table
              dataSource={results.slice((currentPage - 1) * pageSize, currentPage * pageSize)} // phân trang
              rowKey="id"
              columns={[
                { title: "Date", dataIndex: "date", key: "date" },
                { title: "Category", dataIndex: "category", key: "category" },
                { title: "Score", dataIndex: "score", key: "score", render: (_: any, record: Result) => `${record.score}/${record.total}` },
              ]}
              pagination={false}
            />
            <div style={{ marginTop: 10, display: "flex", justifyContent: "center" }}>
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={results.length}
                onChange={page => setCurrentPage(page)}
                showSizeChanger={false} // không cho thay đổi pageSize
              />
            </div>
          </>
        )}
      </>
    )}

    {/* Footer */}
    <div style={{ marginTop: "auto" }}>
      <Footer />
    </div>
  </div>
);
};

export default QuizPage; 
//fix ở phân trang sau khi làm xong quiz thì phân trang k bị foooter đè lên 
