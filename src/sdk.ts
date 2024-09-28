import { Config } from '@wagmi/core'
import { SmartAccountClient } from 'permissionless'
import { useMemo } from 'react'
import { base, baseSepolia } from 'viem/chains'
import { useConfig } from 'wagmi'

import { getTicketPricePaidCore } from './boxOffice/getTicketPricePaid'
import { getTotalTicketsSoldCore } from './boxOffice/getTotalTicketsSold'
import { getWalletTokenIdsCore } from './boxOffice/getWalletTokenIds'
import { isTicketOwnerCore } from './boxOffice/isTicketOwner'
import {
  ContractInteractor,
  createContractInteractor
} from './contractInteractor'
import * as hooks from './hooks'
import { getRefundsCore } from './hooks'
import { acceptArtistNominationCore } from './registry/artist/acceptArtistNomination'
import { deregisterArtistCore } from './registry/artist/deregisterArtist'
import { getArtistCore } from './registry/artist/getArtist'
import { isArtistRegisteredCore } from './registry/artist/isArtistRegistered'
import { nominateArtistCore } from './registry/artist/nominateArtist'
import { updateArtistCore } from './registry/artist/updateArtist'
import { acceptOrganizerNominationCore } from './registry/organizer/acceptOrganizerNomination'
import { deregisterOrganizerCore } from './registry/organizer/deregisterOrganizer'
import { getOrganizerCore } from './registry/organizer/getOrganizer'
import { isOrganizerRegisteredCore } from './registry/organizer/isOrganizerRegistered'
import { nominateOrganizerCore } from './registry/organizer/nominateOrganizer'
import { updateOrganizerCore } from './registry/organizer/updateOrganizer'
import { decrementReferralCreditsCore } from './registry/referral/decrementReferralCredits'
import { getReferralCreditsCore } from './registry/referral/getReferralCredits'
import { incrementReferralCreditsCore } from './registry/referral/incrementReferralCredits'
import { setCreditControlPermissionCore } from './registry/referral/setCreditControlPermissions'
import { acceptVenueNominationCore } from './registry/venue/acceptVenueNomination'
import { deregisterVenueCore } from './registry/venue/deregisterVenue'
import { getVenueCore } from './registry/venue/getVenue'
import { isVenueRegisteredCore } from './registry/venue/isVenueRegistered'
import { nominateVenueCore } from './registry/venue/nominateVenue'
import { updateVenueCore } from './registry/venue/updateVenue'
import { cancelShowCore } from './show/cancelShow'
import { completeShowCore } from './show/completeShow'
import { getNumberOfVotersCore } from './show/getNumberOfVoters'
import { getShowByIdCore } from './show/getShowById'
import { getShowOrganizerCore } from './show/getShowOrganizer'
import { getShowStatusCore } from './show/getShowStatus'
import { getShowToTicketProxyCore } from './show/getShowToTicketProxy'
import { getShowToVenueProxyCore } from './show/getShowToVenueProxy'
import { getTicketTierInfoCore } from './show/getTicketTierInfo'
import { hasTicketCore } from './show/hasTicket'
import { isArtistCore } from './show/isArtist'
import { isOrganizerCore } from './show/isOrganizer'
import { payoutCore } from './show/payout'
import { proposeShowCore } from './show/proposeShow'
import { refundBribeCore } from './show/refundBribe'
import { refundTicketCore } from './show/refundTicket'
import { voteForEmergencyRefundCore } from './show/voteForEmergencyRefund'
import { withdrawRefundCore } from './show/withdrawRefund'
import { calculateTotalPayoutAmountCore } from './showVault/calculateTotalPayoutAmount'
import { getShowPaymentTokenCore } from './showVault/getShowPaymentToken'
import { getShowTokenVaultCore } from './showVault/showTokenVault'
import { getShowVaultCore } from './showVault/showVault'
import { getTicketPricePaidAndTierIndexCore } from './ticket/getTicketPricePaidAndTierIndex'
import { purchaseTicketsCore } from './ticket/purchaseTickets'
import { purchaseTicketsForCore } from './ticket/purchaseTicketsFor'
import { setDefaultURIForShowCore } from './ticket/setDefaultURIForShow'
import { setTokenURICore } from './ticket/setTokenURI'
import { getDateVotesCore } from './venue/getDateVotes'
import { getHasDateVotedCore } from './venue/getHasDateVoted'
import { getHasTicketOwnerVotedCore } from './venue/getHasTicketOwnerVoted'
import { getHasVotedCore } from './venue/getHasVoted'
import { getPreviousDateVoteCore } from './venue/getPreviousDateVotes'
import { getPreviousVoteCore } from './venue/getPreviousVote'
import { getProposalCore } from './venue/getProposal'
import { getProposalPeriodCore } from './venue/getProposalPeriod'
import { getProposalsCountCore } from './venue/getProposalsCount'
import { getSelectedDateCore } from './venue/getSelectedDate'
import { getSelectedProposalIndexCore } from './venue/getSelectedProposalIndex'
import { getShowProposalsCore } from './venue/getShowProposals'
import { getVotingPeriodsCore } from './venue/getVotingPeriods'
import { submitProposalCore } from './venue/submitProposal'
import { ticketHolderVenueVoteCore } from './venue/ticketHolderVenueVote'
import { voteCore } from './venue/vote'
import { voteForDateCore } from './venue/voteForDate'
import { Abi, encodeFunctionData, erc20Abi } from 'viem'
import { TicketABI } from './abis'

export class SelloutSDK {
  private contractInteractor: ContractInteractor
  private chainId: typeof base.id | typeof baseSepolia.id

  constructor(
    private config: Config,
    chainId: typeof base.id | typeof baseSepolia.id,
    smartAccountClient?: SmartAccountClient
  ) {
    this.chainId = chainId
    const chain = config.chains.find(c => c.id === chainId)
    if (!chain) {
      throw new Error(`Chain with id ${chainId} not found in config`)
    }
    this.contractInteractor = createContractInteractor(
      config,
      chain,
      smartAccountClient
    )
  }

  encodeFunctionData(abi: Abi, functionName: string, args: any[]): string {
    return encodeFunctionData({
      abi,
      functionName,
      args
    })
  }

  // ====================================
  // SHOW
  // ====================================
  async proposeShow(
    input: Omit<hooks.ProposeShow, 'chainId'>,
    options?: { smart?: boolean }
  ) {
    return proposeShowCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor,
      this.config,
      options
    )
  }

  async cancelShow(
    input: Omit<hooks.CancelShow, 'chainId'>,
    options?: { smart?: boolean }
  ) {
    return cancelShowCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor,
      this.config,
      options
    )
  }

  async completeShow(
    input: Omit<hooks.CompleteShow, 'chainId'>,
    options?: { smart?: boolean }
  ) {
    return completeShowCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor,
      this.config,
      options
    )
  }

  async getNumberOfVoters(input: Omit<hooks.GetNumberOfVoters, 'chainId'>) {
    return getNumberOfVotersCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor
    )
  }

  async getShowById(input: Omit<hooks.GetShowById, 'chainId'>) {
    return getShowByIdCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor
    )
  }

  async getShowOrganizer(input: Omit<hooks.GetShowOrganizer, 'chainId'>) {
    return getShowOrganizerCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor
    )
  }

  async getShowStatus(input: Omit<hooks.GetShowStatus, 'chainId'>) {
    return getShowStatusCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor
    )
  }

  async getShowToTicketProxy(
    input: Omit<hooks.GetShowToTicketProxy, 'chainId'>
  ) {
    return getShowToTicketProxyCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor
    )
  }

  async getShowToVenueProxy(input: Omit<hooks.GetShowToVenueProxy, 'chainId'>) {
    return getShowToVenueProxyCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor
    )
  }

  async getTicketTierInfo(input: Omit<hooks.GetTicketTierInfo, 'chainId'>) {
    return getTicketTierInfoCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor
    )
  }

  async hasTicket(input: Omit<hooks.HasTicketInput, 'chainId'>) {
    return hasTicketCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor
    )
  }

  async isArtist(input: Omit<hooks.IsArtistInput, 'chainId'>) {
    return isArtistCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor
    )
  }

  async isOrganizer(input: Omit<hooks.IsOrganizerInput, 'chainId'>) {
    return isOrganizerCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor
    )
  }

  async payout(
    input: Omit<hooks.Payout, 'chainId'>,
    options?: { smart?: boolean }
  ) {
    return payoutCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor,
      this.config,
      options
    )
  }

  async refundBribe(
    input: Omit<hooks.RefundBribe, 'chainId'>,
    options?: { smart?: boolean }
  ) {
    return refundBribeCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor,
      this.config,
      options
    )
  }

  async refundTicket(
    input: Omit<hooks.RefundTicket, 'chainId'>,
    options?: { smart?: boolean }
  ) {
    return refundTicketCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor,
      this.config,
      options
    )
  }

  async voteForEmergencyRefund(
    input: Omit<hooks.VoteForEmergencyRefund, 'chainId'>,
    options?: { smart?: boolean }
  ) {
    return voteForEmergencyRefundCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor,
      this.config,
      options
    )
  }

  async withdrawRefund(
    input: Omit<hooks.WithdrawRefund, 'chainId'>,
    options?: { smart?: boolean }
  ) {
    return withdrawRefundCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor,
      this.config,
      options
    )
  }

  // ====================================
  // BOX OFFICE
  // ====================================
  async getTicketPricePaid(input: Omit<hooks.GetTicketPricePaid, 'chainId'>) {
    return getTicketPricePaidCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor
    )
  }

  async getTotalTicketsSold(input: Omit<hooks.GetTotalTicketsSold, 'chainId'>) {
    return getTotalTicketsSoldCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor
    )
  }

  async getWalletTokenIds(input: Omit<hooks.GetWalletTokenIds, 'chainId'>) {
    return getWalletTokenIdsCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor
    )
  }

  async isTicketOwner(input: Omit<hooks.IsTicketOwner, 'chainId'>) {
    return isTicketOwnerCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor
    )
  }

  // ====================================
  // SHOW VAULT
  // ====================================
  async calculateTotalPayoutAmount(
    input: Omit<hooks.CalculateTotalPayoutAmount, 'chainId'>
  ) {
    return calculateTotalPayoutAmountCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor
    )
  }

  async getShowPaymentToken(input: Omit<hooks.GetShowPaymentToken, 'chainId'>) {
    return getShowPaymentTokenCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor
    )
  }

  async getShowTokenVault(input: Omit<hooks.GetShowTokenVault, 'chainId'>) {
    return getShowTokenVaultCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor
    )
  }

  async getShowVault(input: Omit<hooks.GetShowVault, 'chainId'>) {
    return getShowVaultCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor
    )
  }

  // ====================================
  // TICKET
  // ====================================
  async getTicketPricePaidAndTierIndex(
    input: Omit<hooks.GetTicketPricePaidAndTierIndex, 'chainId'>
  ) {
    return getTicketPricePaidAndTierIndexCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor
    )
  }

  async purchaseTickets(
    input: Omit<hooks.PurchaseTickets, 'chainId'>,
    options?: { smart?: boolean }
  ) {
    return purchaseTicketsCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor,
      this.config,
      options
    )
  }

  async purchaseTicketsFor(
    input: Omit<hooks.PurchaseTicketsFor, 'chainId'>,
    options?: { smart?: boolean; encodeOnly?: boolean }
  ) {
    if (options?.encodeOnly) {
      return this.encodeFunctionData(TicketABI as Abi, 'purchaseTicketsFor', [
        input.recipient,
        input.showId,
        input.tierIndex,
        input.quantity,
        input.paymentToken
      ])
    }

    return purchaseTicketsForCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor,
      this.config,
      options
    )
  }

  async setDefaultURIForShow(
    input: Omit<hooks.SetDefaultURIForShow, 'chainId'>,
    options?: { smart?: boolean }
  ) {
    return setDefaultURIForShowCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor,
      this.config,
      options
    )
  }

  async setTokenURI(
    input: Omit<hooks.SetTokenURI, 'chainId'>,
    options?: { smart?: boolean }
  ) {
    return setTokenURICore(
      { ...input, chainId: this.chainId },
      this.contractInteractor,
      this.config,
      options
    )
  }

  // ====================================
  // VENUE
  // ====================================
  async getDateVotes(input: Omit<hooks.GetDateVotes, 'chainId'>) {
    return getDateVotesCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor
    )
  }

  async getHasDateVoted(input: Omit<hooks.GetHasDateVoted, 'chainId'>) {
    return getHasDateVotedCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor
    )
  }

  async getHasTicketOwnerVoted(
    input: Omit<hooks.GetHasTicketOwnerVoted, 'chainId'>
  ) {
    return getHasTicketOwnerVotedCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor
    )
  }

  async getHasVoted(input: Omit<hooks.GetHasVotedInput, 'chainId'>) {
    return getHasVotedCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor
    )
  }

  async getPreviousDateVote(
    input: Omit<hooks.GetPreviousDateVotes, 'chainId'>
  ) {
    return getPreviousDateVoteCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor
    )
  }

  async getPreviousVote(input: Omit<hooks.GetPreviousVote, 'chainId'>) {
    return getPreviousVoteCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor
    )
  }

  async getProposal(input: Omit<hooks.GetProposal, 'chainId'>) {
    return getProposalCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor
    )
  }

  async getProposalPeriod(input: Omit<hooks.GetProposalPeriod, 'chainId'>) {
    return getProposalPeriodCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor
    )
  }

  async getProposalsCount(input: Omit<hooks.GetProposalsCount, 'chainId'>) {
    return getProposalsCountCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor
    )
  }

  async getRefunds(input: Omit<hooks.GetRefunds, 'chainId'>) {
    return getRefundsCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor
    )
  }

  async getSelectedDate(input: Omit<hooks.GetSelectedDate, 'chainId'>) {
    return getSelectedDateCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor
    )
  }

  async getSelectedProposalIndex(
    input: Omit<hooks.GetSelectedProposalIndex, 'chainId'>
  ) {
    return getSelectedProposalIndexCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor
    )
  }

  async getShowProposals(input: Omit<hooks.GetShowProposals, 'chainId'>) {
    return getShowProposalsCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor
    )
  }

  async getVotingPeriods(input: Omit<hooks.GetVotingPeriods, 'chainId'>) {
    return getVotingPeriodsCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor
    )
  }

  async submitProposal(
    input: Omit<hooks.SubmitProposal, 'chainId'>,
    options?: { smart?: boolean }
  ) {
    return submitProposalCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor,
      this.config,
      options
    )
  }

  async ticketHolderVenueVote(
    input: Omit<hooks.TicketHolderVenueVote, 'chainId'>,
    options?: { smart?: boolean }
  ) {
    return ticketHolderVenueVoteCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor,
      this.config,
      options
    )
  }

  async vote(
    input: Omit<hooks.Vote, 'chainId'>,
    options?: { smart?: boolean }
  ) {
    return voteCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor,
      this.config,
      options
    )
  }

  async voteForDate(
    input: Omit<hooks.VoteForDate, 'chainId'>,
    options?: { smart?: boolean }
  ) {
    return voteForDateCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor,
      this.config,
      options
    )
  }

  // ====================================
  // REGISTRY - ARTIST
  // ====================================
  async acceptArtistNomination(
    input: Omit<hooks.AcceptArtistNomination, 'chainId'>,
    options?: { smart?: boolean }
  ) {
    return acceptArtistNominationCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor,
      this.config,
      options
    )
  }

  async deregisterArtist(
    input: Omit<hooks.DeregisterArtist, 'chainId'>,
    options?: { smart?: boolean }
  ) {
    return deregisterArtistCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor,
      this.config,
      options
    )
  }

  async getArtist(input: Omit<hooks.GetArtist, 'chainId'>) {
    return getArtistCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor
    )
  }

  async isArtistRegistered(input: Omit<hooks.IsArtistRegistered, 'chainId'>) {
    return isArtistRegisteredCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor
    )
  }

  async nominateArtist(
    input: Omit<hooks.NominateArtist, 'chainId'>,
    options?: { smart?: boolean }
  ) {
    return nominateArtistCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor,
      this.config,
      options
    )
  }

  async updateArtist(
    input: Omit<hooks.UpdateArtist, 'chainId'>,
    options?: { smart?: boolean }
  ) {
    return updateArtistCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor,
      this.config,
      options
    )
  }

  // ====================================
  // REGISTRY - ORGANIZER
  // ====================================
  async acceptOrganizerNomination(
    input: Omit<hooks.AcceptOrganizerNomination, 'chainId'>,
    options?: { smart?: boolean }
  ) {
    return acceptOrganizerNominationCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor,
      this.config,
      options
    )
  }

  async deregisterOrganizer(
    input: Omit<hooks.DeregisterOrganizer, 'chainId'>,
    options?: { smart?: boolean }
  ) {
    return deregisterOrganizerCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor,
      this.config,
      options
    )
  }

  async getOrganizer(input: Omit<hooks.GetOrganizer, 'chainId'>) {
    return getOrganizerCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor
    )
  }

  async isOrganizerRegistered(
    input: Omit<hooks.IsOrganizerRegistered, 'chainId'>
  ) {
    return isOrganizerRegisteredCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor
    )
  }

  async nominateOrganizer(
    input: Omit<hooks.NominateOrganizer, 'chainId'>,
    options?: { smart?: boolean }
  ) {
    return nominateOrganizerCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor,
      this.config,
      options
    )
  }

  async updateOrganizer(
    input: Omit<hooks.UpdateOrganizer, 'chainId'>,
    options?: { smart?: boolean }
  ) {
    return updateOrganizerCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor,
      this.config,
      options
    )
  }

  // ====================================
  // REFERRAL
  // ====================================
  async decrementReferralCredits(
    input: Omit<hooks.DecrementReferralCredits, 'chainId'>,
    options?: { smart?: boolean }
  ) {
    return decrementReferralCreditsCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor,
      this.config,
      options
    )
  }

  async getReferralCredits(input: Omit<hooks.GetReferralCredits, 'chainId'>) {
    return getReferralCreditsCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor
    )
  }

  async incrementReferralCredits(
    input: Omit<hooks.IncrementReferralCredits, 'chainId'>,
    options?: { smart?: boolean }
  ) {
    return incrementReferralCreditsCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor,
      this.config,
      options
    )
  }

  async setCreditControlPermission(
    input: Omit<hooks.SetCreditControlPermission, 'chainId'>,
    options?: { smart?: boolean }
  ) {
    return setCreditControlPermissionCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor,
      this.config,
      options
    )
  }

  // ====================================
  // REGISTRY - VENUE
  // ====================================
  async acceptVenueNomination(
    input: Omit<hooks.AcceptVenueNomination, 'chainId'>,
    options?: { smart?: boolean }
  ) {
    return acceptVenueNominationCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor,
      this.config,
      options
    )
  }

  async deregisterVenue(
    input: Omit<hooks.DeregisterVenue, 'chainId'>,
    options?: { smart?: boolean }
  ) {
    return deregisterVenueCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor,
      this.config,
      options
    )
  }

  async getVenue(input: Omit<hooks.GetVenueInput, 'chainId'>) {
    return getVenueCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor
    )
  }

  async isVenueRegistered(input: Omit<hooks.IsVenueRegistered, 'chainId'>) {
    return isVenueRegisteredCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor
    )
  }

  async nominateVenue(
    input: Omit<hooks.NominateVenue, 'chainId'>,
    options?: { smart?: boolean }
  ) {
    return nominateVenueCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor,
      this.config,
      options
    )
  }

  async updateVenue(
    input: Omit<hooks.UpdateVenueInput, 'chainId'>,
    options?: { smart?: boolean }
  ) {
    return updateVenueCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor,
      this.config,
      options
    )
  }

  // ====================================
  // ERC20 UTILITIES
  // ====================================
  async getERC20Balance(
    tokenAddress: `0x${string}`,
    account: `0x${string}`
  ): Promise<bigint> {
    return this.contractInteractor.read<bigint>({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: 'balanceOf',
      args: [account]
    })
  }

  async getERC20Allowance(
    tokenAddress: `0x${string}`,
    owner: `0x${string}`,
    spender: `0x${string}`
  ): Promise<bigint> {
    return this.contractInteractor.read<bigint>({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: 'allowance',
      args: [owner, spender]
    })
  }

  async approveERC20(
    tokenAddress: `0x${string}`,
    spender: `0x${string}`,
    amount: bigint,
    options?: { smart?: boolean }
  ) {
    return this.contractInteractor.execute(
      {
        address: tokenAddress,
        abi: erc20Abi,
        functionName: 'approve',
        args: [spender, amount]
      },
      options
    )
  }
}

// ====================================
// Hook to use SelloutSDK
// ====================================
export function useSelloutSDK(
  chainId: typeof base.id | typeof baseSepolia.id,
  smartAccountClient?: SmartAccountClient
): SelloutSDK {
  const config = useConfig()

  return useMemo(() => {
    return new SelloutSDK(config, chainId, smartAccountClient)
  }, [config, chainId, smartAccountClient])
}
