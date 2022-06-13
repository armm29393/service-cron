import axios from 'axios';
import fs from 'fs-extra'
import { readFile } from 'fs/promises';
const setting = JSON.parse(await readFile("setting.json", "utf8"));

console.log(`====== ${setting.title} ======`)

const updateContent = async (service) => {
  try {
    const {
      name,
      url,
      backupDir,
      deleteBackupAfterSuccess = false,
    } = service
    let count = 1
    let isError = true
    let result
    // Backup before call service
    if (backupDir?.length > 0) {
      for await (const src of backupDir) {
        const dst = `${src}-backup`
        fs.removeSync(dst)
        fs.copySync(src, dst, { overwrite: true })
      }
    }
    do {
      try {
        console.log(`Run ${name} #${count} : Running...`)
        result = await axios.get(url, { headers: {'Content-Type': 'application/json'} });
        isError = !(result.status >= 200 && result.status < 300)
      } catch (error) {
        console.log('Error! Try Again..')
        count += 1
        // Restore if failed
        if (backupDir.length > 0) {
          for await (const src of backupDir) {
            const dst = `${src}-backup`
            fs.copySync(dst, src, { overwrite: true })
          }
        }
        await sleep(5000)
      }
    } while (isError);
    // Delete backup when success
    if (deleteBackupAfterSuccess && backupDir.length > 0) {
      for await (const src of backupDir) {
        const dst = `${src}-backup`
        fs.removeSync(dst)
      }
    }
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
    const result = await updateContent(service)
    console.log(`Result : ${JSON.stringify(result)}`)
    await sleep(2000)
  }
}

main()
