create database if not exists nitj_drone character set utf8mb4 collate utf8mb4_unicode_ci;
use nitj_drone;

create table if not exists admins (
  id int unsigned not null auto_increment primary key,
  email varchar(254) not null unique,
  password_hash varchar(255) not null,
  created_at timestamp not null default current_timestamp
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci;

create table if not exists events (
  id int unsigned not null auto_increment primary key,
  title varchar(180) not null,
  description text not null,
  venue varchar(180) not null default '',
  event_date date not null,
  status enum('upcoming', 'completed') not null,
  image_url varchar(500) null,
  created_at timestamp not null default current_timestamp,
  updated_at timestamp not null default current_timestamp on update current_timestamp,
  index events_status_date_idx (status, event_date)
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci;
