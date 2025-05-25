'use client'

import { SettingsContext } from "@/context/SettingsContext"
import { useContext } from "react"
import CustomDetails from "../CustomDetails"
import { ResourceEnum } from "@/types/data/vanilla-7.0"
import CustomImage from "../CustomImage"
import { getResource } from "@/types/utils"

export default function MaterialSettings() {
  const [settings, setSettings] = useContext(SettingsContext).settingsState

  return (
    <CustomDetails
      summary="Resources"
      className="border-t border-surface-a30 transition-all duration-200"
      onChange={(open, target) => {
        if (open) {
          target.classList.add("my-2")
          target.classList.remove("border-t")
        } else {
          target.classList.add("border-t")
          target.classList.remove("my-2")
        }
      }}
    >
      <table className="border-spacing-1 border-separate">
        <thead>
          <tr>
            <th></th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {Object.values(ResourceEnum).map((resourceName) => {
            const resource = getResource(resourceName);
            if (!resource || (resource && resource.producedBy.length < 1)) return;

            return (
              <tr key={resourceName}>
                <td>
                  <div className="flex items-center gap-1">
                    <CustomImage name={resourceName} />
                    <span>:</span>
                  </div>
                </td>
                <td>
                  <div className="flex flex-wrap gap-1">
                    {resource.producedBy.map((buildingName) => (
                      <div
                        key={buildingName}
                        className={`p-1 cursor-pointer rounded-md duration-100 ${settings.gameSettings[settings.gameMode].resources[resourceName] == buildingName ? "bg-primary" : "bg-surface-a20"}`}
                        onClick={() => setSettings(prev => ({
                          ...prev,
                          gameSettings: {
                            ...prev.gameSettings,
                            [prev.gameMode]: {
                              ...prev.gameSettings[prev.gameMode],
                              resources: {
                                ...prev.gameSettings[prev.gameMode].resources,
                                [resourceName]: buildingName
                              }
                            }
                          }
                        }))}
                      >
                        <CustomImage name={buildingName} />
                      </div>
                    ))}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </CustomDetails>
  )
}