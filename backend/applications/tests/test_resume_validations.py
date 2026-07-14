import io

import pytest
from django.core.exceptions import ValidationError
from django.core.files.uploadedfile import SimpleUploadedFile
from pypdf import PdfWriter

from applications.validators.resume import (
    validate_file_extension,
    validate_file_size,
    validate_pdf_integrity,
    validate_pdf_mime,
    validate_pdf_signature,
)


MAX_RESUME_SIZE = 5 * 1024 * 1024


def build_uploaded_file(name: str, content: bytes, content_type: str = "application/pdf"):
    return SimpleUploadedFile(name, content, content_type=content_type)


def build_pdf_with_one_page():
    buffer = io.BytesIO()
    writer = PdfWriter()
    writer.add_blank_page(width=72, height=72)
    writer.write(buffer)
    buffer.seek(0)
    return build_uploaded_file("resume.pdf", buffer.read(), "application/pdf")


def build_pdf_without_pages():
    buffer = io.BytesIO()
    writer = PdfWriter()
    writer.write(buffer)
    buffer.seek(0)
    return build_uploaded_file("empty.pdf", buffer.read(), "application/pdf")


class TestValidateFileSize:

    def test_file_smaller_than_5mb_does_not_raise(self):
        file = build_uploaded_file(
            "small.pdf",
            b"a" * (MAX_RESUME_SIZE - 1),
        )

        validate_file_size(file)

    def test_file_exactly_5mb_does_not_raise(self):
        file = build_uploaded_file(
            "exact.pdf",
            b"a" * MAX_RESUME_SIZE,
        )

        validate_file_size(file)

    def test_file_larger_than_5mb_raises_validation_error(self):
        file = build_uploaded_file(
            "large.pdf",
            b"a" * (MAX_RESUME_SIZE + 1),
        )

        with pytest.raises(ValidationError, match="Resume file cannot exceed 5 MB."):
            validate_file_size(file)


class TestValidateFileExtension:

    def test_pdf_extension_is_valid(self):
        file = build_uploaded_file("resume.pdf", b"dummy content")

        validate_file_extension(file)

    @pytest.mark.parametrize("filename", ["resume.txt", "resume.docx", "resume.exe"])
    def test_non_pdf_extension_raises_validation_error(self, filename):
        file = build_uploaded_file(filename, b"dummy content")

        with pytest.raises(ValidationError):
            validate_file_extension(file)


class TestValidatePdfMime:

    @pytest.mark.parametrize("mime_value", ["application/pdf"])
    def test_pdf_mime_is_valid(self, mocker, mime_value):
        file = build_uploaded_file("resume.pdf", b"dummy content")
        file.seek(3)

        mocker.patch("applications.validators.resume.magic.from_buffer", return_value=mime_value)

        validate_pdf_mime(file)

        assert file.tell() == 3

    @pytest.mark.parametrize("mime_value", ["text/plain", "image/png"])
    def test_non_pdf_mime_raises_validation_error(self, mocker, mime_value):
        file = build_uploaded_file("resume.pdf", b"dummy content")
        file.seek(5)

        mocker.patch("applications.validators.resume.magic.from_buffer", return_value=mime_value)

        with pytest.raises(ValidationError, match="Invalid file type."):
            validate_pdf_mime(file)

        assert file.tell() == 5


class TestValidatePdfSignature:

    def test_pdf_signature_is_valid(self):
        file = build_uploaded_file("resume.pdf", b"%PDF-1.7\nrest of file")
        initial_position = file.tell()

        validate_pdf_signature(file)

        assert file.tell() == initial_position

    def test_invalid_pdf_signature_raises_validation_error(self):
        file = build_uploaded_file("resume.pdf", b"ABCDrest of file")
        initial_position = file.tell()

        with pytest.raises(ValidationError, match="Corrupted or invalid PDF file."):
            validate_pdf_signature(file)

        assert file.tell() == initial_position


class TestValidatePdfIntegrity:

    def test_valid_pdf_with_at_least_one_page_is_valid(self):
        file = build_pdf_with_one_page()
        initial_position = file.tell()

        validate_pdf_integrity(file)

        assert file.tell() == initial_position

    def test_pdfreader_exception_raises_validation_error(self, mocker):
        file = build_pdf_with_one_page()
        initial_position = file.tell()

        mocker.patch(
            "applications.validators.resume.PdfReader",
            side_effect=Exception("broken pdf"),
        )

        with pytest.raises(ValidationError, match="Corrupted or invalid PDF file."):
            validate_pdf_integrity(file)

        assert file.tell() == initial_position

    def test_pdf_without_pages_raises_validation_error_current_bug(self):
        file = build_pdf_without_pages()
        initial_position = file.tell()

        with pytest.raises(ValidationError, match="Corrupted or invalid PDF file."):
            validate_pdf_integrity(file)

        assert file.tell() == initial_position

    def test_pdf_integrity_restores_pointer_after_validation(self):
        file = build_pdf_with_one_page()
        initial_position = file.tell()

        validate_pdf_integrity(file)

        assert file.tell() == initial_position