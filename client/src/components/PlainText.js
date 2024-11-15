import React from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const PlainText = ({ onChange, value }) => {
  const handleRemarkChange = (content) => {
    onChange(content); // Update state without removing HTML on every keystroke
  };

  const handleBlur = () => {
    // Remove HTML tags when focus is lost, keeping only plain text
    const plainText = value.replace(/<\/?[^>]+(>|$)/g, "");
    onChange(plainText);
  };

  return (
    <ReactQuill
      value={value}
      onChange={handleRemarkChange}
      onBlur={handleBlur}
      theme="snow"
      placeholder="Add a remark..."
      modules={{
        toolbar: [
          [{ header: '1' }, { header: '2' }, { font: [] }],
          [{ list: 'ordered' }, { list: 'bullet' }],
          ['bold', 'italic', 'underline'],
          ['link', 'image'],
          [{ align: [] }],
          ['clean']
        ],
      }}
    />
  );
};

export default PlainText;
