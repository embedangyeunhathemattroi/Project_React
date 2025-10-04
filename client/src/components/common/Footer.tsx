import React from 'react';

export default function Footer() {
  return (
    <footer
      style={{
        position: 'fixed',   
        bottom: 0,
        left: 0,
        width: '100%',       
        backgroundColor: '#f8f9fa',
        textAlign: 'center',
        padding: '1rem 0',
        boxShadow: '0 -2px 5px rgba(0,0,0,0.1)',
        zIndex: 1000,    
      }}
    >
      &#169; 2024 VocabApp. All rights reserved.
    </footer>
  );
}
