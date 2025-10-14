import React from "react";
interface FlashCardProps {
  word: string;         
  meaning: string;       
  flipped: boolean;      
  onFlip: () => void;    
  width?: string;        
  height?: string;     
}

const FlashCard: React.FC<FlashCardProps> = ({
  word,
  meaning,
  flipped,
  onFlip,
  width = "400px",
  height = "250px",
}) => {
  return (
    <div
      onClick={onFlip}
      style={{
        width,
        height,
        perspective: "1000px",
        cursor: "pointer",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          textAlign: "center",
          transition: "transform 0.6s",
          transformStyle: "preserve-3d", 
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)", 
        }}
      >
        <div
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            backfaceVisibility: "hidden", 
            borderRadius: "15px",
            backgroundColor: "#fff", 
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            boxShadow: "0 8px 20px rgba(0,0,0,0.3)", 
            fontSize: "1.8rem",
            fontWeight: "bold",
          }}
        >
          {word}
        </div>
        <div
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            backfaceVisibility: "hidden",
            borderRadius: "15px",
            backgroundColor: "#d9f7be", 
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
            fontSize: "1.8rem",
            fontWeight: "bold",
            transform: "rotateY(180deg)", 
          }}
        >
          {meaning} 
        </div>
      </div>
    </div>
  );
};

export default FlashCard;
