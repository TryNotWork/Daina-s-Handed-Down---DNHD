function getNoticeData() {
  return new Promise((resolve, reject) => {
    const noticeData = JSON.parse(localStorage.getItem('noticeData'));
    const date = new Date().getTime();

    if(noticeData && date - noticeData.date < 1000 * 60 * 5) {
      return resolve(noticeData.data);
    }

    fetch('https://api.yncs2022.com/noticeData')
      .then(response => response.json())
      .then(resData => {
        const localData = {
          date: new Date().getTime(),
          data: resData.data,
        }
        localStorage.setItem('noticeData', JSON.stringify(localData));
        return resolve(resData.data);
      })
      .catch(fetchError => {
        if(noticeData) {
          return resolve(noticeData.data);
        }
        return reject(fetchError);
      })
  })
}

export { getNoticeData };