client.on('data', (data) => {
    container.innerText += '\n' + JSON.stringify(data);
    // document.write(data);
})