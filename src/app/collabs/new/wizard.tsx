"use client";
import { useEffect, useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Command, CommandList, CommandItem, CommandInput, CommandEmpty } from "@/components/ui/command";


type Tag = { id:string; label:string };


type ContactRow = { id:string; email:string|null; phone:string|null; language:string|null; role:string|null };


type Platform = 'YouTube'|'Instagram'|'TikTok'|'X'|'Facebook';
const PLATFORM_TYPES: Record<Platform, string[]> = {
    YouTube: ["Intégration vidéo", "Vidéo complète", "Short"],
    Instagram: ["Post", "Story", "Reel"],
    TikTok: ["Vidéo", "Live"],
    X: ["Post"],
    Facebook: ["Post", "Story"],
};


const LANGS = [
    { code:'fr', label:'Français' },
    { code:'en', label:'Anglais' },
    { code:'es', label:'Espagnol' },
    { code:'de', label:'Allemand' },
    { code:'it', label:'Italien' },
    { code:'pt', label:'Portugais' },
    { code:'nl', label:'Néerlandais' },
];


const COUNTRIES = [
    { code:'FR', label:'France' },
    { code:'CN', label:'Chine' },
// — ajoute ici une liste plus large si besoin —
    { code:'DE', label:'Allemagne' },
    { code:'ES', label:'Espagne' },
    { code:'IT', label:'Italie' },
    { code:'GB', label:'Royaume-Uni' },
    { code:'US', label:'États-Unis' },
    { code:'PT', label:'Portugal' },
    { code:'NL', label:'Pays-Bas' },
];

const PAYMENT_TERMS = ["À réception", "Net 15", "Net 30", "Net 45", "Net 60"];


const steps = [
    { key: 'basics', title: 'Base', desc:'Marque, produit, catégories' },
    { key: 'agreement', title: 'Accord', desc:'Contrat, négociation, exclusivité' },
    { key: 'deliverables', title: 'Livrables', desc:'Plateformes et contenus' },
    { key: 'money', title: 'Montant', desc:'Paiement et conditions' },
    { key: 'contact', title: 'Contact', desc:'Langue, pays, contact' },
    { key: 'publish', title: 'Publication', desc:'Liens, commentaires, fin' },
];


export default function NewCollabWizard({ tags, createAction }: { tags: Tag[]; createAction: (data:any)=>Promise<void> }){
    const [step, setStep] = useState(0);
    const [form, setForm] = useState<any>({
        currency:'EUR', language:'fr', deliverablesItems:[], tagIds:[], publicationLinks:[], brandName:'', category:'',
        usagePaidMedia:false, usageDuration:'', usageRegions:[],
    });
    const [loading, setLoading] = useState(false);


// brand autocomplete
    const [brandQ, setBrandQ] = useState("");
    const [brandOpts, setBrandOpts] = useState<Array<{id:string;name:string}>>([]);
    const [brandOpen, setBrandOpen] = useState(false);

    useEffect(()=>{
        const id = setTimeout(async ()=>{
            const r = await fetch(`/api/brands/suggest?q=${encodeURIComponent(brandQ.trim())}`);
            if (r.ok) setBrandOpts(await r.json());
        }, 200);
        return ()=> clearTimeout(id);
    }, [brandQ]);

    // category suggestions
    const [catQ, setCatQ] = useState("");
    const [catOpts, setCatOpts] = useState<any[]>([]);
    const [catOpen, setCatOpen] = useState(false);

    useEffect(()=>{
        const id = setTimeout(async ()=>{
            const r = await fetch(`/api/categories/suggest?q=${encodeURIComponent(catQ.trim())}`);
            if (r.ok) setCatOpts(await r.json());
        }, 200);
        return ()=> clearTimeout(id);
    }, [catQ]);


// tags local + create
    const [allTags, setAllTags] = useState<Tag[]>(tags);
    const [newTag, setNewTag] = useState("");
    async function addTag(){
        const label = newTag.trim();
        if (!label) return;
        const r = await fetch('/api/tags/suggest', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ label })});
        const j = await r.json();
        if (j.ok) {
            setAllTags((t)=> [...t, j.tag]);
            setForm((f:any)=> ({...f, tagIds: [...new Set([...(f.tagIds||[]), j.tag.id])] }));
            setNewTag("");
        }
    }

    // contacts suggestion (brand dependent)
    const [contacts, setContacts] = useState<ContactRow[]>([]);
    useEffect(()=>{
        const id = setTimeout(async ()=>{
            if (form.brandId) {
                const r = await fetch(`/api/brands/contacts?brandId=${form.brandId}`);
                if (r.ok) setContacts(await r.json());
            }
        }, 200);
        return ()=> clearTimeout(id);
    }, [form.brandId]);


    const s = steps[step];
    const next = () => setStep(x=> Math.min(x+1, steps.length-1));
    const prev = () => setStep(x=> Math.max(x-1, 0));


    async function submit(){
        setLoading(true);
        try { await createAction(form); window.location.href = "/"; } finally { setLoading(false); }
    }

    return (
        <div className="min-h-screen flex items-start justify-center bg-gray-50 p-6">
            <Card className="w-full max-w-3xl shadow-xl rounded-2xl">
                <CardHeader>
                    <CardTitle className="text-2xl">Nouvelle collaboration</CardTitle>
                    <CardDescription>{s.title} — {s.desc}</CardDescription>
                    <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gray-900" style={{ width: `${((step+1)/steps.length)*100}%` }} />
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {s.key === 'basics' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="text-sm text-gray-600">Marque</label>
                                <Popover open={brandOpen} onOpenChange={setBrandOpen}>
                                    <PopoverTrigger asChild>
                                        <Input value={form.brandName} placeholder="Saisir une marque" onChange={e=>{ setForm((f:any)=>({...f, brandName:e.target.value, brandId: undefined })); setBrandQ(e.target.value); setBrandOpen(true); }} />
                                    </PopoverTrigger>
                                    <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)]">
                                        <Command>
                                            <CommandInput value={brandQ} onValueChange={setBrandQ} placeholder="Rechercher…" />
                                            <CommandEmpty>Aucune marque. Créer « {brandQ} »</CommandEmpty>
                                            <CommandList>
                                                {brandOpts.map(b=> (
                                                    <CommandItem key={b.id} onSelect={() => { setForm((f:any)=>({...f, brandId:b.id, brandName:b.name})); setBrandOpen(false); }}>
                                                        {b.name}
                                                    </CommandItem>
                                                ))}
                                                {brandQ && (
                                                    <CommandItem onSelect={async ()=>{
                                                        const r = await fetch('/api/brands', {
                                                            method:'POST',
                                                            headers:{'Content-Type':'application/json'},
                                                            body: JSON.stringify({ name: brandQ })
                                                        });
                                                        const j = await r.json();
                                                        if (j.ok){ setForm((f:any)=>({...f, brandId:j.id, brandName:j.name})); setBrandOpen(false); }
                                                    }}>
                                                        + Créer « {brandQ} »
                                                    </CommandItem>
                                                )}
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className="md:col-span-2">
                                <label className="text-sm text-gray-600">Produit</label>
                                <Input onChange={e=>setForm((f:any)=>({...f, product:e.target.value}))} />
                            </div>


                            <div className="md:col-span-2">
                                <label className="text-sm text-gray-600">Catégorie</label>
                                <Popover open={catOpen} onOpenChange={setCatOpen}>
                                    <PopoverTrigger asChild>
                                        <Input value={form.category} placeholder="ex: Technologie" onChange={e=>{ setForm((f:any)=>({...f, category:e.target.value})); setCatQ(e.target.value); setCatOpen(true); }} />
                                    </PopoverTrigger>
                                    <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)]">
                                        <Command>
                                            <CommandInput value={catQ} onValueChange={setCatQ} placeholder="Rechercher…" />
                                            <CommandList>
                                                {catOpts.map(c => (
                                                    <CommandItem
                                                        key={c.id}
                                                        onSelect={() => {
                                                            setForm((f:any) => ({ ...f, category: c.name }));
                                                            setCatOpen(false);
                                                        }}
                                                    >
                                                        {c.name}
                                                    </CommandItem>
                                                ))}
                                                {catQ && (
                                                    <CommandItem onSelect={()=>{ setForm((f:any)=>({...f, category:catQ})); setCatOpen(false); }}>
                                                        + Utiliser « {catQ} »
                                                    </CommandItem>
                                                )}
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className="md:col-span-2">
                                <label className="text-sm text-gray-600">Tags</label>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {allTags.map(t=> (
                                        <button type="button" key={t.id} onClick={()=>{
                                            setForm((f:any)=>{
                                                const has = f.tagIds.includes(t.id);
                                                return { ...f, tagIds: has ? f.tagIds.filter((x:string)=>x!==t.id) : [...f.tagIds, t.id] };
                                            });
                                        }} className={`px-3 py-1 rounded-full text-sm border ${form.tagIds.includes(t.id)?'bg-gray-900 text-white border-gray-900':'bg-white'}`}>
                                            {t.label}
                                        </button>
                                    ))}
                                    <div className="flex items-center gap-2">
                                        <Input value={newTag} onChange={e=>setNewTag(e.target.value)} placeholder="Nouveau tag" className="w-40" />
                                        <Button type="button" variant="secondary" onClick={addTag}>+</Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}


                    {s.key === 'agreement' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center gap-2"><Checkbox checked={!!form.contractSigned} onCheckedChange={v=>setForm((f:any)=>({...f, contractSigned: !!v}))} /> <span>Contrat signé</span></div>
                            <div>
                                <div className="flex items-center gap-2"><Checkbox checked={!!form.negotiatedPrice} onCheckedChange={v=>setForm((f:any)=>({...f, negotiatedPrice: !!v}))} /> <span>Prix négocié</span></div>
                            </div>
                            <div className="md:col-span-2">
                                <div className="flex items-center gap-2"><Checkbox checked={!!form.accessoriesNegotiated} onCheckedChange={v=>setForm((f:any)=>({...f, accessoriesNegotiated: !!v}))} /> <span>Accessoires négociés</span></div>
                                {form.accessoriesNegotiated && (
                                    <div className="mt-2">
                                        <label className="text-sm text-gray-600">Détail des accessoires</label>
                                        <Input placeholder="ex: batterie supplémentaire, objectif 50mm…" onChange={e=>setForm((f:any)=>({...f, accessoriesDetails:e.target.value}))} />
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="text-sm text-gray-600">Exclusivité jusqu’au</label>
                                <Input type="date" onChange={e=>setForm((f:any)=>({...f, exclusivityUntil:e.target.value}))} />
                            </div>
                            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="flex items-center gap-2"><Checkbox checked={!!form.usagePaidMedia} onCheckedChange={v=>setForm((f:any)=>({...f, usagePaidMedia: !!v}))} /> <span>Paid media</span></div>
                                <div>
                                    <label className="text-sm text-gray-600">Durée d’usage</label>
                                    <Input placeholder="ex: 3 mois" onChange={e=>setForm((f:any)=>({...f, usageDuration:e.target.value}))} />
                                </div>
                                <div>
                                    <label className="text-sm text-gray-600">Régions</label>
                                    <Input placeholder="ex: EU, US" onChange={e=>setForm((f:any)=>({...f, usageRegions: e.target.value.split(',').map((s)=>s.trim()).filter(Boolean)}))} />
                                </div>
                            </div>
                        </div>
                    )}

                    {s.key === 'deliverables' && (
                        <div className="space-y-3">
                            <div className="text-sm text-gray-600">Livrables (Plateforme / Type / Quantité)</div>
                            {(form.deliverablesItems||[]).map((it:any, idx:number)=> {
                                const platform = (it.platform||'') as Platform;
                                const typeOptions = PLATFORM_TYPES[platform as Platform] || [];
                                return (
                                    <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                                        <div className="col-span-4">
                                            <Select defaultValue={it.platform} onValueChange={v=>updateDeliverable(idx,{platform:v as Platform, type:''})}>
                                                <SelectTrigger><SelectValue placeholder="Plateforme"/></SelectTrigger>
                                                <SelectContent>
                                                    {(['YouTube','Instagram','TikTok','X','Facebook'] as Platform[]).map(p=> <SelectItem key={p} value={p}>{p}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="col-span-5">
                                            <Select value={it.type||''} onValueChange={v=>updateDeliverable(idx,{type:v})}>
                                                <SelectTrigger><SelectValue placeholder={platform? 'Type' : 'Choisir une plateforme d’abord'} /></SelectTrigger>
                                                <SelectContent>
                                                    {typeOptions.length ? typeOptions.map(t=> <SelectItem key={t} value={t}>{t}</SelectItem>) : <></>}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="col-span-2"><Input type="number" min={1} defaultValue={it.count||1} onChange={e=>updateDeliverable(idx,{count:Number(e.target.value)})}/></div>
                                        <div className="col-span-1 text-right"><button type="button" className="text-sm underline" onClick={()=>removeDeliverable(idx)}>X</button></div>
                                    </div>
                                );})}
                            <Button type="button" variant="secondary" onClick={()=>addDeliverable()}>Ajouter un livrable</Button>
                        </div>
                    )}

                    {s.key === 'money' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm text-gray-600">Devise</label>
                                <Select defaultValue={form.currency} onValueChange={v=>setForm((f:any)=>({...f, currency:v}))}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {['EUR','USD','GBP'].map(c=> <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className="text-sm text-gray-600">Montant</label>
                                <Input type="number" min={0} onChange={e=>setForm((f:any)=>({...f, amount: e.target.value}))} />
                            </div>
                            <div>
                                <label className="text-sm text-gray-600">Méthode de paiement</label>
                                <Input placeholder="Virement, PayPal…" onChange={e=>setForm((f:any)=>({...f, paymentMethod:e.target.value}))} />
                            </div>
                            <div>
                                <label className="text-sm text-gray-600">Conditions de paiement</label>
                                <Select onValueChange={v=>setForm((f:any)=>({...f, paymentTerms:v}))}>
                                    <SelectTrigger><SelectValue placeholder="ex: Net 30" /></SelectTrigger>
                                    <SelectContent>
                                        {PAYMENT_TERMS.map(t=> <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-center gap-2"><Checkbox checked={!!form.paid} onCheckedChange={v=>setForm((f:any)=>({...f, paid: !!v}))} /> <span>Payé</span></div>
                            <div>
                                <label className="text-sm text-gray-600">Date de paiement</label>
                                <Input type="date" onChange={e=>setForm((f:any)=>({...f, paidAt:e.target.value}))} />
                            </div>
                        </div>
                    )}

                    {s.key === 'contact' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm text-gray-600">Langue</label>
                                <Select value={form.language} onValueChange={v=>setForm((f:any)=>({...f, language:v}))}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {LANGS.map(l=> <SelectItem key={l.code} value={l.code}>{l.label}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className="text-sm text-gray-600">Pays</label>
                                <Select value={form.country} onValueChange={v=>setForm((f:any)=>({...f, country:v}))}>
                                    <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                                    <SelectContent>
                                        {COUNTRIES.map(c=> <SelectItem key={c.code} value={c.code}>{c.label}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-sm text-gray-600">Contact de la marque</label>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {contacts.map(c => (
                                        <button type="button" key={c.id} className="px-3 py-1 rounded-full text-sm border bg-white" onClick={()=>{
                                            setForm((f:any)=> ({...f, contactEmail: c.email || '', contactPhone: c.phone || '' }));
                                        }}>
                                            {(c.role? c.role+" · ":'')}{c.email || c.phone}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="text-sm text-gray-600">Email contact</label>
                                <Input type="email" value={form.contactEmail||''} onChange={e=>setForm((f:any)=>({...f, contactEmail:e.target.value}))} />
                            </div>
                            <div>
                                <label className="text-sm text-gray-600">Téléphone contact</label>
                                <Input value={form.contactPhone||''} onChange={e=>setForm((f:any)=>({...f, contactPhone:e.target.value}))} />
                            </div>
                        </div>
                    )}

                    {s.key === 'publish' && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center gap-2"><Checkbox checked={!!form.isCompleted} onCheckedChange={v=>setForm((f:any)=>({...f, isCompleted: !!v}))} /> <span>Collab terminée</span></div>
                                <div className="flex items-center gap-2"><Checkbox checked={!!form.isPublic} onCheckedChange={v=>setForm((f:any)=>({...f, isPublic: !!v}))} /> <span>Rendre public si terminée</span></div>
                            </div>
                            <div>
                                <label className="text-sm text-gray-600">Liens de publication</label>
                                {(form.publicationLinks||[]).map((u:string, i:number)=> (
                                    <div key={i} className="flex gap-2 mt-2">
                                        <Input defaultValue={u} onChange={e=>updateLink(i, e.target.value)} />
                                        <button type="button" className="text-sm underline" onClick={()=>removeLink(i)}>Suppr</button>
                                    </div>
                                ))}
                                <Button type="button" variant="secondary" className="mt-2" onClick={()=>addLink()}>Ajouter un lien</Button>
                            </div>
                            <div>
                                <label className="text-sm text-gray-600">Commentaire public</label>
                                <Textarea onChange={e=>setForm((f:any)=>({...f, comment:e.target.value}))} />
                            </div>
                            <div>
                                <label className="text-sm text-gray-600">Notes privées</label>
                                <Textarea onChange={e=>setForm((f:any)=>({...f, privateNotes:e.target.value}))} />
                            </div>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="flex justify-between">
                    <Button type="button" variant="secondary" onClick={prev} disabled={step===0}>Retour</Button>
                    {step < steps.length-1 ? (
                        <Button type="button" onClick={next}>Continuer</Button>
                    ) : (
                        <Button type="button" onClick={submit} disabled={loading}>{loading? 'Enregistrement…':'Créer la collab'}</Button>
                    )}
                </CardFooter>
            </Card>
        </div>
    );

    function addDeliverable(){ setForm((f:any)=> ({...f, deliverablesItems:[...f.deliverablesItems, { platform:'', type:'', count:1 }]})); }
    function removeDeliverable(i:number){ setForm((f:any)=> ({...f, deliverablesItems:f.deliverablesItems.filter((_:any,idx:number)=>idx!==i)})); }
    function updateDeliverable(i:number, patch:any){ setForm((f:any)=> ({...f, deliverablesItems:f.deliverablesItems.map((it:any,idx:number)=> idx===i ? { ...it, ...patch } : it)})); }
    function addLink(){ setForm((f:any)=> ({...f, publicationLinks:[...f.publicationLinks, ""]})); }
    function removeLink(i:number){ setForm((f:any)=> ({...f, publicationLinks:f.publicationLinks.filter((_:any,idx:number)=>idx!==i)})); }
    function updateLink(i:number, v:string){ setForm((f:any)=> ({...f, publicationLinks:f.publicationLinks.map((u:string,idx:number)=> idx===i ? v : u)})); }
}
