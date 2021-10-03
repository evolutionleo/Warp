client.on('data', (data) => {
    container.innerText += '\n' + data;
    // document.write(data);
})