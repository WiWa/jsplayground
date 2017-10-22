
type WebElem = Window | Document | HTMLElement
type Handler<A> = (detail: A) => void
type Subscription =  (e: CustomEventInit) => void
export class ObsLite<A>{
  constructor(private eventName: string, 
              private listenOn: WebElem = window){ }

  subscribe(h: Handler<A>): Subscription {
    const subscription =  (e: CustomEventInit) => h(e.detail)
    this.listenOn.addEventListener(this.eventName, subscription)
    return subscription
  }
  unsubscribe(s: Subscription) {
    this.listenOn.removeEventListener(this.eventName, s)
  }
  subscribeOnce(h: Handler<A>) {
    const h_ = this.subscribe((detail: A) => {
      this.unsubscribe(h_)
      h(detail)
    })
  }
  emit(detail: A) {
    this.listenOn.dispatchEvent(new CustomEvent(this.eventName, {
      detail: detail
    }))
  }
}

export default ObsLite