import React, { useRef, forwardRef, useImperativeHandle, useEffect, useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const PlainTextQuillEditor = forwardRef(({ onChange, value }, ref) => {
  const quillRef = useRef(null); // Create a ref for the ReactQuill instance
  const [editorContent, setEditorContent] = useState(value || ""); // State to manage the editor content

  // Method to set editor contents, exposed via ref
  useImperativeHandle(ref, () => ({
    setEditorContents: (content) => {
      if (quillRef.current) {
        // Set editor content correctly
        quillRef.current.getEditor().setContents(quillRef.current.getEditor().clipboard.convert(content));
      }
    },
  }));

  // When the value prop changes, update the editor content
  useEffect(() => {
    if (value !== undefined && value !== editorContent) {
      setEditorContent(value);
    }
  }, [value, editorContent]);

  const handleRemarkChange = (content) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');

    // Extract plain text (for storing and processing)
    const text = doc.body.textContent || "";

    // Extract URLs with href attribute only (http:// or https:// links)
    const links = Array.from(doc.querySelectorAll('a'))
      .filter(a => a.hasAttribute('href') && a.href && (a.href.startsWith('http://') || a.href.startsWith('https://')))
      .map(a => a.href); // Extract only the URL as a string

    // Prepare the information for submission
    const informationDescription = {
       // Store the URLs as an array
      htmlContent: content // Raw HTML content for preserving styles (bold, bullet points, links, etc.)
    };

    // Pass the formatted description to the parent component
    onChange(informationDescription);
  };

  return (
    <div>
      <ReactQuill
        ref={quillRef} // Attach the ref
        value={editorContent} // Set the value prop for the editor
        onChange={handleRemarkChange}
        theme="snow"
        placeholder="Add a remark..."
        modules={{
          toolbar: [
            [{ 'header': '1' }, { 'header': '2' }, { 'font': [] }],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['bold', 'italic', 'underline'],
            ['link'],
            [{ 'align': [] }],
            ['clean']
          ],
        }}
      />
    </div>
  );
});

export default PlainTextQuillEditor;
