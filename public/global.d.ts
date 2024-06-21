declare global {

  const console: {
    log: (...args: any[]) => void
    error: (...args: any[]) => void
  }

  const setTimeout: (callback: () => void, timeout?: number) => number
  const clearTimeout: (timerId: number) => void

  /**
   * Add message event listener from main thread.
   * 
   * (Only supports use in Worker) 
   */
  var onmessage: ((event: {
    data: any
  }) => void) | undefined

  /**
   * Add error event listener.
   * 
   * (Only supports use in Worker) 
   */
  var onerror: ((error: {
    filename: string
    message: string
    stack?: string
  }) => void) | undefined

  /**
   * Post message to main thread.
   * 
   * (Only supports use in Worker) 
   */
  const postMessage: (message: any) => void

  /**
   * Close current thread.
   * 
   * (Only supports use in Worker) 
   */
  const close: () => void

//   /**
//  * A file-like object of immutable, raw data. Blobs represent data that isn't necessarily in a JavaScript-native format. The File interface is based on Blob, inheriting blob functionality and expanding it to support files on the user's system.
//  *
//  * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Blob)
//  */
//   interface Blob {
//     /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Blob/size) */
//     readonly size: number
//     /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Blob/type) */
//     readonly type: string
//     /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Blob/arrayBuffer) */
//     arrayBuffer(): Promise<ArrayBuffer>
//     /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Blob/slice) */
//     slice(start?: number, end?: number, contentType?: string): Blob
//     /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Blob/text) */
//     text(): Promise<string>
//   }

//   declare var Blob: {
//     prototype: Blob
//     new(blobParts?: (string | ArrayBuffer | ArrayBufferView | Blob)[], options?: BlobPropertyBag): Blob
//   }


//   interface Body {
//     /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Request/body) */
//     readonly body: string | FormData | Blob | null
//     /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Request/arrayBuffer) */
//     arrayBuffer(): Promise<ArrayBuffer>
//     /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Request/blob) */
//     blob(): Promise<Blob>
//     /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Request/formData) */
//     formData(): Promise<FormData>
//     /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Request/json) */
//     json(): Promise<any>
//     /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Request/text) */
//     text(): Promise<string>
//   }

//   interface ResponseInit {
//     status?: number
//     statusText?: string
//     headers?: HeadersInit | Headers
//   }


//   interface RequestInit {
//     method?: string
//     headers?: HeadersInit | Headers
//     body?: any
//     mode?: RequestMode
//     credentials?: RequestCredentials
//     cache?: RequestCache
//     redirect?: RequestRedirect
//     referrer?: string
//   }

//   interface Request {
//     /**
//      * Returns the cache mode associated with request, which is a string indicating how the request will interact with the browser's cache when fetching.
//      *
//      * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Request/cache)
//      */
//     readonly cache: RequestCache
//     /**
//      * Returns the credentials mode associated with request, which is a string indicating whether credentials will be sent with the request always, never, or only when sent to a same-origin URL.
//      *
//      * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Request/credentials)
//      */
//     readonly credentials: RequestCredentials
//     /**
//      * Returns a Headers object consisting of the headers associated with request. Note that headers added in the network layer by the user agent will not be accounted for in this object, e.g., the "Host" header.
//      *
//      * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Request/headers)
//      */
//     readonly headers: Headers
//     /**
//      * Returns request's HTTP method, which is "GET" by default.
//      *
//      * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Request/method)
//      */
//     readonly method: string
//     /**
//      * Returns the mode associated with request, which is a string indicating whether the request will use CORS, or will be restricted to same-origin URLs.
//      *
//      * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Request/mode)
//      */
//     readonly mode: RequestMode
//     /**
//      * Returns the redirect mode associated with request, which is a string indicating how redirects for the request will be handled during fetching. A request will follow redirects by default.
//      *
//      * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Request/redirect)
//      */
//     readonly redirect: RequestRedirect
//     /**
//      * Returns the referrer of request. Its value can be a same-origin URL if explicitly set in init, the empty string to indicate no referrer, and "about:client" when defaulting to the global's default. This is used during fetching to determine the value of the `Referer` header of the request being made.
//      *
//      * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Request/referrer)
//      */
//     readonly referrer: string
//     /**
//      * Returns the URL of request as a string.
//      *
//      * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Request/url)
//      */
//     readonly url: string
//     /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Request/clone) */
//     clone(): Request
//   }

//   declare var Request: {
//     prototype: Request
//     new(input: string | Request, init?: RequestInit): Request
//   }

//   /**
//  * Provides a way to easily construct a set of key/value pairs representing form fields and their values, which can then be easily sent using the XMLHttpRequest.send() method. It uses the same format a form would use if the encoding type were set to "multipart/form-data".
//  *
//  * [MDN Reference](https://developer.mozilla.org/docs/Web/API/FormData)
//  */
//   interface FormData {
//     /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/FormData/append) */
//     append(name: string, value: string | Blob): void
//     append(name: string, value: string): void
//     append(name: string, blobValue: Blob, filename?: string): void
//     /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/FormData/delete) */
//     delete(name: string): void
//     /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/FormData/get) */
//     get(name: string): string | Blob | null
//     /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/FormData/getAll) */
//     getAll(name: string): (string | Blob | null)[]
//     /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/FormData/has) */
//     has(name: string): boolean
//     /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/FormData/set) */
//     set(name: string, value: string | Blob): void
//     set(name: string, value: string): void
//     set(name: string, blobValue: Blob, filename?: string): void
//     forEach(callbackfn: (value: string | Blob, key: string, parent: FormData) => void, thisArg?: any): void
//   }

//   declare var FormData: {
//     prototype: FormData
//     new(): FormData
//   }

//   /**
//  * This Fetch API interface represents the response to a request.
//  *
//  * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Response)
//  */
//   interface Response extends Body {
//     /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Response/headers) */
//     readonly headers: Headers
//     /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Response/ok) */
//     readonly ok: boolean
//     /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Response/status) */
//     readonly status: number
//     /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Response/statusText) */
//     readonly statusText: string
//     /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Response/url) */
//     readonly url: string
//     /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Response/clone) */
//     clone(): Response
//   }

//   declare var Response: {
//     prototype: Response
//     new(body?: Blob | null, init?: ResponseInit): Response
//   }


//   type HeadersInit = [string, string][] | Record<string, string> | Headers


//   /**
//    * This Fetch API interface allows you to perform various actions on HTTP request and response headers. These actions include retrieving, setting, adding to, and removing. A Headers object has an associated header list, which is initially empty and consists of zero or more name and value pairs.  You can add to this using methods like append() (see Examples.) In all methods of this interface, header names are matched by case-insensitive byte sequence.
//    *
//    * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Headers)
//    */
//   interface Headers {
//     /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Headers/append) */
//     append(name: string, value: string): void
//     /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Headers/delete) */
//     delete(name: string): void
//     /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Headers/get) */
//     get(name: string): string | null
//     /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Headers/has) */
//     has(name: string): boolean
//     /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Headers/set) */
//     set(name: string, value: string): void
//     forEach(callbackfn: (value: string, key: string, parent: Headers) => void, thisArg?: any): void

//     /** Returns an iterator allowing to go through all key/value pairs contained in this object. */
//     entries(): IterableIterator<[string, string]>
//     /** Returns an iterator allowing to go through all keys of the key/value pairs contained in this object. */
//     keys(): IterableIterator<string>
//     /** Returns an iterator allowing to go through all values of the key/value pairs contained in this object. */
//     values(): IterableIterator<string>
//   }

//   declare var Headers: {
//     prototype: Headers
//     new(init?: HeadersInit): Headers
//   }

//   declare function fetch(input: string | Request, init?: RequestInit & {
//     debugLabel?: string
//   }): Promise<Response>

}

export { }