

const downFile = (blob, name) => {
  const url = window.URL.createObjectURL(
    new Blob([blob]),
  );
  let link = document.createElement('a');
  document.body.appendChild(link);
  link.href = url;
  link.target = "_blank";
  link.setAttribute(
    "download",
    name,
  );
  link.click();
  document.body.removeChild(link);
}
    
  const downloadFile = (file, type, name) => {
    if (type === "url") {
      fetch(file).then((response) => response.blob())
      .then((blob) => {
        downFile(blob, name);
      });
    } else if (type === "file") {
      downFile(file, name);
    }
};

export default downloadFile;
export { downloadFile };