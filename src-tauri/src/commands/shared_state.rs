use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use tokio::sync::mpsc::UnboundedSender;
use warp::ws::Message;

pub type Clients = Arc<Mutex<HashMap<String, UnboundedSender<Message>>>>;

lazy_static::lazy_static! {
    pub static ref CLIENTS: Clients = Arc::new(Mutex::new(HashMap::new()));
}
