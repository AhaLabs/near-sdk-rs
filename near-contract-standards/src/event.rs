use std::borrow::Cow;

use serde::{Deserialize, Serialize};
use serde_with::skip_serializing_none;

#[derive(Serialize, Debug)]
#[serde(tag = "standard")]
#[serde(rename_all = "snake_case")]
pub enum NearEvent<'a> {
    #[serde(borrow)]
    Nep171(Nep171Event<'a>),
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Nep171Event<'a> {
    pub version: &'static str,
    #[serde(flatten)]
    #[serde(borrow)]
    pub event_kind: Nep171EventKind<'a>,
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(tag = "event", content = "data")]
#[serde(rename_all = "snake_case")]
#[allow(clippy::enum_variant_names)]
pub enum Nep171EventKind<'a> {
    #[serde(borrow)]
    NftMint(Vec<NftMintData<'a>>),
    #[serde(borrow)]
    NftTransfer(Vec<NftTransferData<'a>>),
    #[serde(borrow)]
    NftBurn(Vec<NftBurnData<'a>>),
}

#[skip_serializing_none]
#[derive(Serialize, Deserialize, Debug)]
pub struct NftMintData<'a> {
    #[serde(borrow)]
    pub owner_id: Cow<'a, str>,
    #[serde(borrow)]
    pub token_ids: Vec<Cow<'a, str>>,
    #[serde(borrow)]
    pub memo: Option<Cow<'a, str>>,
}

impl<'a> NftMintData<'a> {
    pub fn new<S>(owner_id: S, token_ids: Vec<S>, memo: Option<S>) -> NftMintData<'a>
    where
        S: Into<Cow<'a, str>>,
    {
        Self {
            owner_id: owner_id.into(),
            token_ids: token_ids.into_iter().map(|s| s.into()).collect(),
            memo: memo.map(|t| t.into()),
        }
    }
}

#[skip_serializing_none]
#[derive(Serialize, Deserialize, Debug)]
pub struct NftTransferData<'a> {
    #[serde(borrow)]
    pub old_owner_id: Cow<'a, str>,
    #[serde(borrow)]
    pub new_owner_id: Cow<'a, str>,
    #[serde(borrow)]
    pub token_ids: Vec<Cow<'a, str>>,
    #[serde(borrow)]
    pub authorized_id: Option<Cow<'a, str>>,
    #[serde(borrow)]
    pub memo: Option<Cow<'a, str>>,
}

impl<'a> NftTransferData<'a> {
    pub fn new<S>(
        old_owner_id: S,
        new_owner_id: S,
        token_ids: Vec<S>,
        authorized_id: Option<S>,
        memo: Option<S>,
    ) -> NftTransferData<'a>
    where
        S: Into<Cow<'a, str>>,
    {
        Self {
            authorized_id: authorized_id.map(|t| t.into()),
            old_owner_id: old_owner_id.into(),
            new_owner_id: new_owner_id.into(),
            token_ids: token_ids.into_iter().map(|s| s.into()).collect(),
            memo: memo.map(|t| t.into()),
        }
    }
}

#[skip_serializing_none]
#[derive(Serialize, Deserialize, Debug)]
pub struct NftBurnData<'a> {
    #[serde(borrow)]
    pub owner_id: Cow<'a, str>,
    #[serde(borrow)]
    pub token_ids: Vec<Cow<'a, str>>,
    #[serde(borrow)]
    pub authorized_id: Option<Cow<'a, str>>,
    #[serde(borrow)]
    pub memo: Option<Cow<'a, str>>,
}

impl<'a> NftBurnData<'a> {
    pub fn new<S>(
        owner_id: S,
        token_ids: Vec<S>,
        authorized_id: Option<S>,
        memo: Option<S>,
    ) -> NftBurnData<'a>
    where
        S: Into<Cow<'a, str>>,
    {
        Self {
            owner_id: owner_id.into(),
            token_ids: token_ids.into_iter().map(|s| s.into()).collect(),
            authorized_id: authorized_id.map(|t| t.into()),
            memo: memo.map(|t| t.into()),
        }
    }
}

impl<'a> NearEvent<'a> {
    pub fn new_171(version: &'static str, event_kind: Nep171EventKind<'a>) -> Self {
        NearEvent::Nep171(Nep171Event { version, event_kind })
    }

    pub fn new_171_v1(event_kind: Nep171EventKind<'a>) -> Self {
        NearEvent::new_171("1.0.0", event_kind)
    }

    pub fn nft_burn(data: Vec<NftBurnData<'a>>) -> Self {
        NearEvent::new_171_v1(Nep171EventKind::NftBurn(data))
    }
    pub fn nft_transfer(data: Vec<NftTransferData<'a>>) -> Self {
        NearEvent::new_171_v1(Nep171EventKind::NftTransfer(data))
    }

    pub fn nft_mint(data: Vec<NftMintData<'a>>) -> Self {
        NearEvent::new_171_v1(Nep171EventKind::NftMint(data))
    }

    pub(crate) fn to_json_string(&self) -> String {
        serde_json::to_string(self).unwrap()
    }

    pub fn to_json_event_string(&self) -> String {
        format!("EVENT_JSON:{}", self.to_json_string())
    }

    pub fn emit(&self) {
        near_sdk::env::log_str(&self.to_json_event_string());
    }

    pub fn emit_nft_mint(owner_id: &str, token_ids: Vec<&str>, memo: Option<&str>)
    {
        NearEvent::emit_nft_mints(vec![NftMintData::new(owner_id, token_ids, memo)]);
    }

    pub fn emit_nft_mints(data: Vec<NftMintData<'a>>) {
        NearEvent::nft_mint(data).emit();
    }

    pub fn emit_nft_transfer(
        old_owner_id: &str,
        new_owner_id: &str,
        token_ids: Vec<&str>,
        authorized_id: Option<&str>,
        memo: Option<&str>,
    )
    {
        NearEvent::emit_nft_transfers(vec![NftTransferData::new(
            old_owner_id,
            new_owner_id,
            token_ids,
            authorized_id,
            memo,
        )]);
    }

    pub fn emit_nft_transfers(data: Vec<NftTransferData<'a>>) {
        NearEvent::nft_transfer(data).emit()
    }

    pub fn emit_nft_burn(
        owner_id: &str,
        token_ids: Vec<&str>,
        authorized_id: Option<&str>,
        memo: Option<&str>,
    )
    {
        NearEvent::emit_nft_burns(vec![NftBurnData::new(owner_id, token_ids, authorized_id, memo)]);
    }

    pub fn emit_nft_burns(data: Vec<NftBurnData<'a>>) {
        NearEvent::nft_burn(data).emit()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn nft_mint() {
        let owner_id = "bob";
        let token_ids = vec!["0", "1"];
        let mint_log = NftMintData::new(owner_id, token_ids, None);
        let event_log = NearEvent::nft_mint(vec![mint_log]);
        assert_eq!(
            serde_json::to_string(&event_log).unwrap(),
            r#"{"standard":"nep171","version":"1.0.0","event":"nft_mint","data":[{"owner_id":"bob","token_ids":["0","1"]}]}"#
        );
    }

    #[test]
    fn nft_mints() {
        let owner_id = "bob";
        let token_ids = vec!["0", "1"];
        let mint_log = NftMintData::new(owner_id, token_ids, None);
        let event_log = NearEvent::nft_mint(vec![
            mint_log,
            NftMintData::new("alice", vec!["2", "3"], Some("has memo")),
        ]);
        assert_eq!(
            event_log.to_json_string(),
            r#"{"standard":"nep171","version":"1.0.0","event":"nft_mint","data":[{"owner_id":"bob","token_ids":["0","1"]},{"owner_id":"alice","token_ids":["2","3"],"memo":"has memo"}]}"#
        );
    }

    #[test]
    fn nft_burn() {
        let owner_id = "bob";
        let token_ids = vec!["0", "1"];
        let burn_data = NftBurnData::new(owner_id, token_ids, None, None);
        let log = NearEvent::nft_burn(vec![burn_data]).to_json_string();
        assert_eq!(
            log,
            r#"{"standard":"nep171","version":"1.0.0","event":"nft_burn","data":[{"owner_id":"bob","token_ids":["0","1"]}]}"#
        );
    }

    #[test]
    fn nft_burns() {
        let owner_id = "bob";
        let token_ids = vec!["0", "1"];
        let log = NearEvent::nft_burn(vec![
            NftBurnData::new("alice", vec!["2", "3"], Some("4"), Some("has memo")),
            NftBurnData::new(owner_id, token_ids, None, None),
        ])
        .to_json_string();
        assert_eq!(
            log,
            r#"{"standard":"nep171","version":"1.0.0","event":"nft_burn","data":[{"owner_id":"alice","token_ids":["2","3"],"authorized_id":"4","memo":"has memo"},{"owner_id":"bob","token_ids":["0","1"]}]}"#
        );
    }

    #[test]
    fn nft_transfer() {
        let old_owner_id = "bob".to_string();
        let new_owner_id = "alice";
        let token_ids = vec!["0", "1"];
        let log = NearEvent::nft_transfer(vec![NftTransferData::new::<&str>(
            &old_owner_id,
            new_owner_id,
            token_ids,
            None,
            None,
        )])
        .to_json_string();
        assert_eq!(
            log,
            r#"{"standard":"nep171","version":"1.0.0","event":"nft_transfer","data":[{"old_owner_id":"bob","new_owner_id":"alice","token_ids":["0","1"]}]}"#
        );
    }

    #[test]
    fn nft_transfers() {
        let old_owner_id = "bob";
        let new_owner_id = "alice";
        let token_ids = vec!["0", "1"];
        let log = NearEvent::nft_transfer(vec![
            NftTransferData::new(
                new_owner_id,
                old_owner_id,
                vec!["2", "3"],
                Some("4"),
                Some("has memo"),
            ),
            NftTransferData::new(old_owner_id, new_owner_id, token_ids, None, None),
        ])
        .to_json_string();
        assert_eq!(
            log,
            r#"{"standard":"nep171","version":"1.0.0","event":"nft_transfer","data":[{"old_owner_id":"alice","new_owner_id":"bob","token_ids":["2","3"],"authorized_id":"4","memo":"has memo"},{"old_owner_id":"bob","new_owner_id":"alice","token_ids":["0","1"]}]}"#
        );
    }
}
