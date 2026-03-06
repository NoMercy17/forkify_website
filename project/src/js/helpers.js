const TIMEOUT_SEC = Number(process.env.TIMEOUT_SEC);

const timeout = function (s) {
  return new Promise(function (_, reject) {
    setTimeout(function () {
      reject(new Error(`Request took too long! Timeout after ${s} second`));
    }, s * 1000);
  });
};

export const AJAX = async function(url, uploadData = undefined){
    try{
        const fetchPro = uploadData ? fetch(url, {
            method: 'POST',
            headers:{
                'Content-Type': 'application/json' // we specify the data is in json format
            },
            body: JSON.stringify(uploadData),
            }) 
            : fetch(url);

        const res = await Promise.race([fetchPro, timeout(TIMEOUT_SEC)]);

        if(!res.ok){
            let message = res.statusText;
            try { const errData = await res.json(); message = errData.message || message; } catch(_) {}
            throw new Error(`${message} (${res.status})`);
        }

        const data = await res.json();
        return data;

    }catch(err){
        throw err;
    }

}


