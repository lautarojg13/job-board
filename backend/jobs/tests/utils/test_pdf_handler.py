from django.core.files.uploadedfile import SimpleUploadedFile

from jobs.utils.pdf_handler import extract_text_from_pdf

MINIMAL_RESUME_PDF = b"""%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length 61 >>
stream
BT
/F1 12 Tf
72 720 Td
(Resume content here for testing) Tj
ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
trailer
<< /Root 1 0 R /Size 6 >>
%%EOF
"""


def build_resume_file(content=MINIMAL_RESUME_PDF, name="resume.pdf"):
    return SimpleUploadedFile(name, content, content_type="application/pdf")


class TestExtractTextFromPdf:

    def test_returns_extracted_text_for_valid_pdf(self):
        result = extract_text_from_pdf(build_resume_file())

        assert "Resume content here for testing" in result

    def test_returns_error_string_for_invalid_signature(self):
        content = b"\x00\x01\x02\x03" + b"Rest of content"

        result = extract_text_from_pdf(build_resume_file(content, name="bad.pdf"))

        assert result.startswith("Error:")

    def test_returns_error_string_for_corrupted_pdf(self):
        content = b"%PDF-1.4\n" + b"Not a real pdf structure"

        result = extract_text_from_pdf(build_resume_file(content, name="corrupted.pdf"))

        assert result.startswith("Error:")