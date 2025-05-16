import { APICommandAutocompleteInteractionResponseCallbackData, APIInteraction, APIInteractionResponse, APIInteractionResponseCallbackData, InteractionResponseType, MessageFlags, RESTPatchAPIInteractionOriginalResponseJSONBody, RESTPatchAPIInteractionOriginalResponseResult } from 'discord-api-types/v10'

export const msg = (data: APIInteractionResponseCallbackData): APIInteractionResponse => ({ type: InteractionResponseType.ChannelMessageWithSource, data: data })
export const autocomplete = (data: APICommandAutocompleteInteractionResponseCallbackData): APIInteractionResponse => ({ type: InteractionResponseType.ApplicationCommandAutocompleteResult, data })
export const defer = (data?: {
    flags?: MessageFlags
}): APIInteractionResponse => ({ type: InteractionResponseType.DeferredChannelMessageWithSource, data: data })
export const updateOriginal = async (i: APIInteraction, data: RESTPatchAPIInteractionOriginalResponseJSONBody): Promise<RESTPatchAPIInteractionOriginalResponseResult> => {
    const resp = await fetch(`https://discord.com/api/webhooks/${i.application_id}/${i.token}/messages/@original`, {
        method: "PATCH",
        body: JSON.stringify(data),
        headers: {
            'content-type': 'application/json'
        }
    })
    if (!resp.ok) throw new Error(`error: ${await resp.text()}`)
    return await resp.json() as RESTPatchAPIInteractionOriginalResponseResult
}