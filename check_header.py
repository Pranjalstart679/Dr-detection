
path = "backend/model/model.h5"
try:
    with open(path, "rb") as f:
        header = f.read(8)
    print(f"Header: {header}")
    if header == b'\x89HDF\r\n\x1a\n':
        print("Valid HDF5 header")
    else:
        print("Invalid HDF5 header")
except Exception as e:
    print(f"Error: {e}")
