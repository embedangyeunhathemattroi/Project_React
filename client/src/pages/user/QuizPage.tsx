import React, { useEffect, useState } from "react"; 
import { Card, Select, Button, Radio, Progress, Table, Spin, Pagination, Modal, Input, Form, Row, Col } from "antd"; 
import Swal from "sweetalert2"; 
import Footer from "../../components/common/Footer"; 
import { fetchResults, type Result } from "../../stores/slices/resultSlice"; 
import { useAppDispatch, useAppSelector } from "../../hook/hooks"; 

const { Option } = Select; 
interface Question {
  id: number;         
  question: string;    
  options: string[];   
  answer: string;      
  category: string; 
}

interface AnswerRecord {
  questionId: number; 
  selected: string;     
  correct: string;     
  isCorrect: boolean;  
}


const QuizPage: React.FC = () => {
  const dispatch = useAppDispatch(); 
  const { results, loading } = useAppSelector(state => state.result); 
  const [questions, setQuestions] = useState<Question[]>([]); 
  const [selectedCategory, setSelectedCategory] = useState("All Categories"); 
  const [quizStarted, setQuizStarted] = useState(false); 
  const [currentIndex, setCurrentIndex] = useState(0); 
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null); 
  const [answers, setAnswers] = useState<AnswerRecord[]>([]); 

  const [score, setScore] = useState(0); 
  const [quizFinished, setQuizFinished] = useState(false); 
  const [currentPage, setCurrentPage] = useState(1); 
  const pageSize = 5; 
  const [manageMode, setManageMode] = useState(false); 

  const [modalVisible, setModalVisible] = useState(false); 

  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null); 
  const [form] = Form.useForm(); 

  const [searchText, setSearchText] = useState(""); 
  useEffect(() => {
    const fetchQ = async () => {
      try {
        const res = await fetch("http://localhost:8080/question"); 
        const data = await res.json(); 
        setQuestions(data);
      } catch (err) {
        console.error(err); 
      }
    };
    fetchQ(); 
    dispatch(fetchResults()); 

  }, [dispatch]);

  const filteredQuestions = questions.filter(q =>
    (selectedCategory === "All Categories" || q.category === selectedCategory) &&
    q.question.toLowerCase().includes(searchText.toLowerCase())
  );
  const answeredCount = answers.length; 
  const totalQuestions = filteredQuestions.length; 
  const quizProgress = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  const currentAnswerRecord = answers.find(a => a.questionId === filteredQuestions[currentIndex]?.id); 

  const handleStartQuiz = () => {
    setQuizStarted(true);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setAnswers([]);
    setScore(0);
    setQuizFinished(false);

  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1); 

      const prevAnswer = answers.find(a => a.questionId === filteredQuestions[currentIndex - 1]?.id);
      setSelectedAnswer(prevAnswer?.selected || null); 

    }
  };

  const handleNext = async () => {
    const currentQuestion = filteredQuestions[currentIndex];
    if (!selectedAnswer && !quizFinished) return; 

    const isCorrect = selectedAnswer === currentQuestion.answer; 
    if (!quizFinished && isCorrect) setScore(prev => prev + 1); 

    if (!quizFinished) {
      setAnswers(prev => [
        ...prev.filter(a => a.questionId !== currentQuestion.id),
        {
          questionId: currentQuestion.id,
          selected: selectedAnswer!,
          correct: currentQuestion.answer,
          isCorrect,
        }
      ]); 
    }

    setSelectedAnswer(null); 

    if (currentIndex < filteredQuestions.length - 1) {
      setCurrentIndex(prev => prev + 1); 

    } else {
      setQuizFinished(true);
      setQuizStarted(false);

      const finalScore = score + (isCorrect ? 1 : 0); 
      const percent = Math.round((finalScore / totalQuestions) * 100);

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
        dispatch(fetchResults()); 
 
      } catch (err) {
        console.error("Failed to save result:", err);
      }
    }
  };


  const handleAddQuestion = () => {
    setEditingQuestion(null); 
    form.resetFields(); 
    setModalVisible(true); 
  };

  const handleEditQuestion = (question: Question) => {
    setEditingQuestion(question); 
    form.setFieldsValue({
      question: question.question,
      category: question.category,
      answer: question.answer,
      options: question.options.join(", ")
    });
    setModalVisible(true);
  };

  const handleDeleteQuestion = (id: number) => {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to delete this question?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!"
    }).then(result => {
      if (result.isConfirmed) {
        setQuestions(prev => prev.filter(q => q.id !== id)); 
        Swal.fire("Deleted!", "Question has been deleted.", "success");
      }
    });
  };

 const handleModalOk = () => {
  form.validateFields().then(values => {
    const newQuestionText = values.question.trim();
    const newCategory = values.category.trim();

    const exists = questions.some(q =>
      q.question.trim().toLowerCase() === newQuestionText.toLowerCase() &&
      q.category === newCategory &&
      (!editingQuestion || q.id !== editingQuestion.id)
    );

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
      return;
    }

    const newQuestion: Question = {
      id: editingQuestion ? editingQuestion.id : Date.now(),
      question: newQuestionText,
      category: newCategory,
      answer: values.answer,
      options: values.options.split(",").map((o: string) => o.trim())
    };

    if (editingQuestion) {
      setQuestions(prev => prev.map(q => q.id === editingQuestion.id ? newQuestion : q));
      Swal.fire("Updated!", "Question has been updated.", "success");
    } else {
      setQuestions(prev => [...prev, newQuestion]);
      Swal.fire("Added!", "Question has been added.", "success");
    }

    setModalVisible(false);
  });
};

  // ----- Render -----
  return (
    <div style={{ maxWidth: '100%', padding: 10, margin: "20px auto", minHeight: "80vh", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <Row style={{ marginBottom: 20, display: "flex", alignItems: "center" }}>
        <Col flex="auto"><h2><strong>Vocabulary Quiz</strong></h2></Col>
        <Col>
          {!quizStarted && (
            <>
              <Button type="primary" onClick={handleStartQuiz} style={{ marginRight: 10 }}>Start Quiz</Button>
              <Button onClick={() => setManageMode(prev => !prev)}>
                {manageMode ? "Back to Quiz" : "Manage Questions"}
              </Button>
            </>
          )}
        </Col>
      </Row>

      {manageMode && (
        <Card style={{ marginBottom: 20 }}>
          <Row gutter={16} align="middle">
            <Col flex="1">
              <Input
                placeholder="Search question..."
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
              />
            </Col>
            <Col>
              <Select
                value={selectedCategory}
                style={{ width: 200 }}
                onChange={value => setSelectedCategory(value)}
              >
                <Option value="All Categories">All Categories</Option>
                {[...new Set(questions.map(q => q.category))].map(cat => (
                  <Option key={cat} value={cat}>{cat}</Option>
                ))}
              </Select>
            </Col>
            <Col>
              <Button type="primary" onClick={handleAddQuestion}>Add Question</Button>
            </Col>
          </Row>

          <Table
            style={{ marginTop: 20 }}
            dataSource={filteredQuestions}
            rowKey="id"
            columns={[
              { title: "Question", dataIndex: "question", key: "question" },
              { title: "Category", dataIndex: "category", key: "category" },
              {
                title: "Actions",
                key: "actions",
                render: (_, record: Question) => (
                  <div style={{ display: "flex", gap: 10 }}>
                    <Button onClick={() => handleEditQuestion(record)}>Edit</Button>
                    <Button danger onClick={() => handleDeleteQuestion(record.id)}>Delete</Button>
                  </div>
                )
              }
            ]}
            pagination={{ pageSize }}
          />

          <Modal
            title={editingQuestion ? "Edit Question" : "Add Question"}
            open={modalVisible}
            onOk={handleModalOk}
            onCancel={() => setModalVisible(false)}
            okText={editingQuestion ? "Update" : "Add"}
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


      {!manageMode && (
        <>
          <Select
            style={{ width: "100%", marginBottom: 20 }}
            value={selectedCategory}
            onChange={value => setSelectedCategory(value)}
            disabled={quizStarted}
          >
            <Option value="All Categories">All Categories</Option>
            {[...new Set(questions.map(q => q.category))].map(cat => (
              <Option key={cat} value={cat}>{cat}</Option>
            ))}
          </Select>


          {quizStarted && (
            <Progress percent={quizProgress} style={{ marginBottom: 20 }} />
          )}

    
          {filteredQuestions.length > 0 && (quizStarted || quizFinished) && (
            <Card style={{ width: "100%", boxShadow: "0 4px 8px rgba(0,0,0,0.1)", marginBottom: 20 }}>
              <h3 style={{
                backgroundColor: selectedAnswer || currentAnswerRecord ? "#e6f7e6" : "transparent",
                padding: "5px 10px",
                borderRadius: 4
              }}>
                {filteredQuestions[currentIndex].question}
              </h3>
              <Radio.Group
                value={selectedAnswer || currentAnswerRecord?.selected || null}
                onChange={e => setSelectedAnswer(e.target.value)}
                style={{ width: "100%" }}
              >
                {filteredQuestions[currentIndex].options.map(opt => {
                  const record = answers.find(a => a.questionId === filteredQuestions[currentIndex].id);
                  const isSelected = selectedAnswer === opt || record?.selected === opt;
                  const correct = record?.correct === opt;
                  const wrong = record && record.selected === opt && !record.isCorrect;

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
                      disabled={quizFinished || !!record}
                    >
                      {opt}
                    </Radio>
                  );
                })}
              </Radio.Group>

              {quizFinished && (
                <div style={{ marginTop: 10, fontWeight: "bold" }}>
                  Bạn đạt {score}/{filteredQuestions.length} câu đúng
                </div>
              )}
            </Card>
          )}


          {quizStarted && (
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
              <Button onClick={handlePrev} disabled={currentIndex === 0}>Prev</Button>
              <Button type="primary" onClick={handleNext}>
                {currentIndex < filteredQuestions.length - 1 ? "Next" : "Finish"}
              </Button>
            </div>
          )}


          <h3>Quiz History</h3>
          {loading ? <Spin /> : (
            <>
              <Table
                dataSource={results.slice((currentPage - 1) * pageSize, currentPage * pageSize)}
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
                  showSizeChanger={false}
                />
              </div>
            </>
          )}
        </>
      )}

   
      <div style={{ marginTop: "auto" }}>
        <Footer />
      </div>
    </div>
  );
};

export default QuizPage;
