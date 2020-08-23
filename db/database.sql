-- Database: elo_ledger

-- DROP DATABASE elo_ledger;

CREATE DATABASE elo_ledger
    WITH 
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'English_United States.1252'
    LC_CTYPE = 'English_United States.1252'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;

-- Table: public.app_user

-- DROP TABLE public.app_user;

CREATE TABLE public.app_user
(
    user_id integer NOT NULL DEFAULT nextval('app_user_user_id_seq'::regclass),
    username character varying(31) COLLATE pg_catalog."default",
    email character varying(255) COLLATE pg_catalog."default",
    password character varying(255) COLLATE pg_catalog."default",
    role character varying(16) COLLATE pg_catalog."default",
    created timestamp with time zone,
    CONSTRAINT app_user_pkey PRIMARY KEY (user_id)
)

TABLESPACE pg_default;

ALTER TABLE public.app_user
    OWNER to postgres;