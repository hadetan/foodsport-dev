import '@/app/shared/css/Featured.css'
import { FaRegStar } from 'react-icons/fa'

export default function Featured({position = 'top'}) {
  return <div className={`featuredBadge ${position==='top' ? 'topLeft' : 'bottomRight'}`}><span className='star'><FaRegStar /></span> Featured</div>
}
