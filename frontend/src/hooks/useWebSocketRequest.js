import { useEffect, useRef } from 'react'
import webSocketService from '../services/websocket.service'

const useWebSocketRequest = (config) => {
  const configRef = useRef(config)
  configRef.current = config

  const execute = async (params) => {
    try {
      const response = await new Promise((resolve, reject) => {
        webSocketService.socket.emit(configRef.current.type, params, (response) => {
          if (response.error) {
            reject(response.error)
          } else {
            resolve(response.data)
          }
        })
      })

      configRef.current.onSuccess(response)
    } catch (error) {
      configRef.current.onError?.(error)
    }
  }

  useEffect(() => {
    const handler = (data) => {
      if (configRef.current.onSuccess) {
        configRef.current.onSuccess(data)
      }
    }

    webSocketService.registerHandler(config.type, handler)

    return () => {
      webSocketService.messageHandlers.delete(config.type)
    }
  }, [config.type])

  useEffect(() => {
    if (configRef.current.autoFetch) {
      execute()
    }
  }, [])

  return { execute }
}

export default useWebSocketRequest
