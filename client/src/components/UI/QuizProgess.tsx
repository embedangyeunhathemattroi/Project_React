// import React from "react";
// import { Progress, Typography } from "antd";

// const { Text } = Typography;

// interface QuizProgressProps {
//   currentIndex: number;
//   totalQuestions: number;
//   category?: string;
// }

// const QuizProgress: React.FC<QuizProgressProps> = ({ currentIndex, totalQuestions, category }) => {
//   const percent = totalQuestions > 0 ? ((currentIndex + 1) / totalQuestions) * 100 : 0;

//   return (
//     <div style={{ marginBottom: 20 }}>
//       {category && <Text strong>Category: {category}</Text>}
//       <Progress
//         percent={Math.round(percent)}
//         format={() => `${currentIndex + 1} / ${totalQuestions}`}
//       />
//     </div>
//   );
// };

// export default QuizProgress;
