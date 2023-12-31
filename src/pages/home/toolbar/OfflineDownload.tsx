import { Box, createDisclosure } from "@hope-ui/solid"
import { ModalInput, SelectWrapper } from "~/components"
import { useFetch, useRouter, useT } from "~/hooks"
import {
  offlineDownload,
  bus,
  handleRespWithNotifySuccess,
  r,
  handleResp,
} from "~/utils"
import { createSignal, onCleanup, onMount } from "solid-js"
import { PResp } from "~/types"

export const OfflineDownload = () => {
  const t = useT()
  const [tools, setTools] = createSignal([] as string[])
  const [toolsLoading, reqTool] = useFetch((): PResp<string[]> => {
    return r.get("/public/offline_download_tools")
  })
  const [tool, setTool] = createSignal("")
  onMount(async () => {
    const resp = await reqTool()
    handleResp(resp, (data) => {
      setTools(data)
      setTool(data[0])
    })
  })

  const { isOpen, onOpen, onClose } = createDisclosure()
  const [loading, ok] = useFetch(offlineDownload)
  const { pathname } = useRouter()
  const handler = (name: string) => {
    if (name === "offline_download") {
      onOpen()
    }
  }
  bus.on("tool", handler)
  onCleanup(() => {
    bus.off("tool", handler)
  })
  return (
    <ModalInput
      title="home.toolbar.offline_download"
      type="text"
      opened={isOpen()}
      onClose={onClose}
      loading={toolsLoading() || loading()}
      tips={t("home.toolbar.offline_download-tips")}
      topSlot={
        <Box mb="$2">
          <SelectWrapper
            value={tool()}
            onChange={(v) => setTool(v)}
            options={tools().map((tool) => {
              return { value: tool, label: tool }
            })}
          />
        </Box>
      }
      onSubmit={async (urls) => {
        const resp = await ok(pathname(), urls.split("\n"), tool())
        handleRespWithNotifySuccess(resp, () => {
          onClose()
        })
      }}
    />
  )
}
