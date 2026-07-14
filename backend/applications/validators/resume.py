import magic

from django.core.exceptions import ValidationError
from django.core.validators import FileExtensionValidator

from pypdf import PdfReader
from pypdf.errors import PdfReadError

MAX_RESUME_SIZE = 5 * 1024 * 1024  # 5 MB

ALLOWED_MIME_TYPES = {
    "application/pdf"
}

PDF_SIGNATURE = b"%PDF"

def validate_file_size(file):
    if file.size > MAX_RESUME_SIZE:
        raise ValidationError(
            "Resume file cannot exceed 5 MB."
        )


def validate_file_extension(file, extension="pdf"):
    extension_validator = FileExtensionValidator(allowed_extensions=[extension])
    extension_validator(file)


def validate_pdf_mime(file):
    initial_pos = file.tell()
    file.seek(0)
    mime = magic.from_buffer(file.read(2048), mime=True)
    file.seek(initial_pos)

    if mime not in ALLOWED_MIME_TYPES:
        raise ValidationError(
            "Invalid file type."
        )


def validate_pdf_signature(file):
    initial_pos = file.tell()

    file.seek(0)
    signature = file.read(4)
    file.seek(initial_pos)
    
    if signature != PDF_SIGNATURE:
        raise ValidationError(
            "Corrupted or invalid PDF file."
        )
        
def validate_pdf_integrity(file):

    initial_pos = file.tell()

    try:
        file.seek(0)

        reader = PdfReader(file)

        if len(reader.pages) == 0:
            raise ValidationError(
                "PDF contains no pages."
            )

    except Exception:
        raise ValidationError(
            "Corrupted or invalid PDF file."
        )

    finally:
        file.seek(initial_pos)
        
RESUME_VALIDATORS = [
    validate_file_size,
    validate_file_extension,
    validate_pdf_mime,
    validate_pdf_signature,
    validate_pdf_integrity
]