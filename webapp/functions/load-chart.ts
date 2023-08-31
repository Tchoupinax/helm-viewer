import { History } from '../storage/history';

export async function loadChart(id: string): Promise<any> {
  const key = `helm-viewer-${id}`

  if (!localStorage.getItem(key)) {
    await fetch("http://localhost:12095")
      .then(res => res.json())
      .then((payload) => {
        History.append({
          date: new Date(),
          id: id ?? "",
          ...payload
        })
      })

      const payload = await fetch("http://localhost:12094").then(res => res.json())
      localStorage.setItem(key, payload)
      return JSON.parse(payload);
  } else {
    return JSON.parse(localStorage.getItem(key)!).content
  }
}