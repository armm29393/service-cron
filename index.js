import axios from 'axios';
import { readFile } from 'fs/promises';
const setting = JSON.parse(await readFile("setting.json", "utf8"));

console.log(`====== ${setting.title} ======`)

const updateContent = async (url, title = '-') => {
  try {
    let count = 1
    let isError = true
    let result
    do {
      try {
        console.log(`Run ${title} #${count} : Running...`)
        result = await axios.get(url, { headers: {'Content-Type': 'application/json'} });
        isError = !(result.status >= 200 && result.status < 300)
      } catch (error) {
        console.log('Error! Try Again..')
        count += 1
        await sleep(5000)
      }
    } while (isError);
    return result.data
  } catch (err) {
    console.error(err);
  }
}

const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const main = async () => {
  for await (const service of setting?.services) {
    const result = await updateContent(service.url, service.name)
    console.log(`Result : ${JSON.stringify(result)}`)
    await sleep(2000)
  }
}

main()
