function QrCodeDisplay({ qrCode, url, fileName }) {
  if (!qrCode) return null;
  const downloadQRCode = () => {
    const link = document.createElement("a");
    link.href = qrCode;
    link.download = fileName || "qrCode.png";
    link.click();
  };

  return (
    <div className="text-center my-3">
      <img src={qrCode} alt="QR Code" style={{ width: "150px" }} />
      <div className="mt-2">
        <button
          className="btn btn-sm btn-primary me-2"
          onClick={() => navigator.clipboard.writeText(url)}
        >
          Copy URL
        </button>
        <button
          className="btn btn-sm btn-success"
          onClick={downloadQRCode}
        >
          Download QR
        </button>
      </div>
    </div>
  );
}

export default QrCodeDisplay;