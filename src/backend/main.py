from pddiktipy import api
from pprint import pprint

# Menggunakan context manager (recommended)
with api() as client:
    # Cari semua data dengan keyword
    hasil = client.search_all('Destra aulia faza ananda putra')
    pprint(hasil)
    
    # Cari mahasiswa spesifik
    # mahasiswa = client.search_mahasiswa('Ilham Riski Wibowo')
    # pprint(mahasiswa)